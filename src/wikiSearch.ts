// see wrangler.toml
declare const PAGE_INDEX: KVNamespace;

const stopWords = /^(I|a|about|an|are|as|at|be|by|com|for|from|how|in|is|it|of|on|or|that|the|the|this|to|was|what|when|where|who|will|with)$/i;

export function searchWords(text: string): string[] {
    return text
        .split(/\W/)
        .filter(w => (0 < w.length) && !w.match(/\W/) && !w.match(stopWords))
        .map(w => w.toLowerCase());
}

async function index(pageName: string, pageContent: string): Promise<string[]> {
    const pageWords = Array.from(new Set(searchWords(pageContent)));
    await Promise.all(pageWords.map((word) => {
        return find([word]).then((pages) => {
            if (pages.includes(pageName)) {
                return;
            }
            pages.push(pageName);
            return PAGE_INDEX.put(word, JSON.stringify(pages))
        })
    }))
    return pageWords;
}

async function find(words: string[]): Promise<string[]> {
    let hits: string[] = [];
    for (const word of words) {
        const pages = await PAGE_INDEX.get(word).then(result => JSON.parse(result || '[]'));
        hits.push(...pages);
    }
    hits = Array.from(new Set(hits));
    hits.sort();
    return hits;
}

async function clear(): Promise<void> {
    const allKeys = (await PAGE_INDEX.list()).keys.map(k => k.name);
    for (const name of allKeys) {
        await PAGE_INDEX.delete(name);
    }
}

export default { index, find, clear }
