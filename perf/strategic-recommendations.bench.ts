import { performance } from 'node:perf_hooks';

// Simulate a slow API call (like tavilySearch)
async function simulateSearch(query: string, delayMs: number = 500) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([{ title: `Result for ${query}` }]);
        }, delayMs);
    });
}

async function runSequential(toolCalls: any[]) {
    const messages: any[] = [];

    for (const toolCall of toolCalls) {
        if (toolCall.function.name === 'search_web') {
            const args = JSON.parse(toolCall.function.arguments);
            const searchResults = await simulateSearch(args.query);

            messages.push({
                tool_call_id: toolCall.id,
                role: 'tool',
                name: 'search_web',
                content: JSON.stringify(searchResults)
            });
        }
    }

    return messages;
}

async function runConcurrent(toolCalls: any[]) {
    const messages: any[] = [];

    // Simulate what the new code will do
    const promises = toolCalls.map(async (toolCall) => {
        if (toolCall.function.name === 'search_web') {
            const args = JSON.parse(toolCall.function.arguments);
            const searchResults = await simulateSearch(args.query);

            return {
                tool_call_id: toolCall.id,
                role: 'tool',
                name: 'search_web',
                content: JSON.stringify(searchResults)
            };
        }
        return null;
    });

    const results = await Promise.all(promises);

    for (const res of results) {
        if (res !== null) {
            messages.push(res);
        }
    }

    return messages;
}

async function runBenchmark() {
    console.log('Running benchmark...');

    const toolCalls = [
        { id: '1', function: { name: 'search_web', arguments: '{"query": "test 1"}' } },
        { id: '2', function: { name: 'search_web', arguments: '{"query": "test 2"}' } },
        { id: '3', function: { name: 'search_web', arguments: '{"query": "test 3"}' } },
    ];

    // Warm up
    await runSequential([{ id: '0', function: { name: 'search_web', arguments: '{"query": "warm up"}' } }]);

    const startSeq = performance.now();
    await runSequential(toolCalls);
    const endSeq = performance.now();
    const timeSeq = endSeq - startSeq;

    const startCon = performance.now();
    await runConcurrent(toolCalls);
    const endCon = performance.now();
    const timeCon = endCon - startCon;

    console.log(`Sequential execution time: ${timeSeq.toFixed(2)} ms`);
    console.log(`Concurrent execution time: ${timeCon.toFixed(2)} ms`);
    console.log(`Improvement: ${(timeSeq / timeCon).toFixed(2)}x faster`);
}

runBenchmark().catch(console.error);
