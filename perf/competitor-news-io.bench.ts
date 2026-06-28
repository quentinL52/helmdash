import { performance } from 'perf_hooks';

// Simulate tavilySearch with a 200ms delay
async function mockTavilySearch(query: string) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return [{ title: `News for ${query}` }];
}

async function runBenchmark() {
    const competitors = [
        { name: 'Comp A' },
        { name: 'Comp B' },
        { name: 'Comp C' },
        { name: 'Comp D' },
        { name: 'Comp E' },
    ];

    console.log('--- Benchmarking Competitor News Fetching ---');

    // 1. Sequential approach (baseline)
    console.log('\nRunning Sequential (Baseline)...');
    const startSequential = performance.now();
    const sequentialNews: Record<string, any[]> = {};
    for (const competitor of competitors) {
        const results = await mockTavilySearch(`"${competitor.name}" startup news`);
        sequentialNews[competitor.name] = results;
    }
    const endSequential = performance.now();
    const sequentialTime = endSequential - startSequential;
    console.log(`Sequential time: ${sequentialTime.toFixed(2)} ms`);

    // 2. Concurrent approach (optimized)
    console.log('\nRunning Concurrent (Optimized)...');
    const startConcurrent = performance.now();
    const concurrentNews: Record<string, any[]> = {};

    await Promise.all(
        competitors.map(async (competitor) => {
            const results = await mockTavilySearch(`"${competitor.name}" startup news`);
            concurrentNews[competitor.name] = results;
        })
    );

    const endConcurrent = performance.now();
    const concurrentTime = endConcurrent - startConcurrent;
    console.log(`Concurrent time: ${concurrentTime.toFixed(2)} ms`);

    // Results
    console.log('\n--- Results ---');
    console.log(`Improvement: ${(sequentialTime - concurrentTime).toFixed(2)} ms faster`);
    console.log(`Speedup: ${(sequentialTime / concurrentTime).toFixed(2)}x`);

    // Validate correctness
    const isCorrect = JSON.stringify(sequentialNews) === JSON.stringify(concurrentNews);
    console.log(`Output matching: ${isCorrect ? '✅ Yes' : '❌ No'}`);
}

runBenchmark().catch(console.error);
