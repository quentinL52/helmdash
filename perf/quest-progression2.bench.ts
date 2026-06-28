import { performance } from 'perf_hooks';

let stateQuests = Array.from({ length: 1000 }).map((_, index) => ({
  id: `q${index}`,
  status: 'active',
  steps: Array.from({ length: 5 }).map((_, sIndex) => ({
    id: `s${sIndex}`,
    completed: false,
    action: `action_${sIndex % 2 === 0 ? 'even' : 'odd'}` // Many steps matching action
  }))
}));

const mockStore = {
  quests: stateQuests,
  updateQuestProgress: (qId: string, sId: string) => {
    mockStore.quests = mockStore.quests.map(q => {
      if (q.id === qId) {
         const newSteps = q.steps.map(s => s.id === sId ? { ...s, completed: true } : s);
         const allDone = newSteps.every(s => s.completed);
         return { ...q, steps: newSteps, status: allDone ? 'completed' : 'active' };
      }
      return q;
    });
  }
};

const mockPlay = () => {};

function resetState() {
  mockStore.quests = Array.from({ length: 1000 }).map((_, index) => ({
    id: `q${index}`,
    status: 'active',
    steps: Array.from({ length: 5 }).map((_, sIndex) => ({
      id: `s${sIndex}`,
      completed: false,
      action: `action_${sIndex % 2 === 0 ? 'even' : 'odd'}` // Many steps matching action
    }))
  }));
}

// Original implementation
function runOriginal(action: string) {
  const currentQuests = mockStore.quests;
  for (const quest of currentQuests) {
    if (quest.status === 'completed') continue;
    for (const step of quest.steps) {
      if (!step.completed && step.action === action) {
        mockStore.updateQuestProgress(quest.id, step.id);
        // Check if quest just completed
        const updatedQuest = mockStore.quests.find(q => q.id === quest.id);
        if (updatedQuest?.status === 'completed') {
          mockPlay();
        }
        break; // Only complete one step per quest per action
      }
    }
  }
}

// Alternative optimized implementation - using simple mapping loop index
// Note that in Zustand, store.quests gets replaced, but the order of quests doesn't change
// So we can index into it safely.
function runOptimizedIndex(action: string) {
  const currentQuests = mockStore.quests;
  for (let i = 0; i < currentQuests.length; i++) {
    const quest = currentQuests[i];
    if (quest.status === 'completed') continue;
    for (const step of quest.steps) {
      if (!step.completed && step.action === action) {
        mockStore.updateQuestProgress(quest.id, step.id);
        // Check if quest just completed
        const updatedQuest = mockStore.quests[i];
        if (updatedQuest?.status === 'completed') {
          mockPlay();
        }
        break; // Only complete one step per quest per action
      }
    }
  }
}

resetState();
for (let i = 0; i < 10; i++) runOriginal('action_even');
resetState();
for (let i = 0; i < 10; i++) runOptimizedIndex('action_even');

const iterations = 50;

resetState();
const startOriginal = performance.now();
for (let i = 0; i < iterations; i++) runOriginal('action_even');
const endOriginal = performance.now();

resetState();
const startOptimizedIndex = performance.now();
for (let i = 0; i < iterations; i++) runOptimizedIndex('action_even');
const endOptimizedIndex = performance.now();

console.log(`Original: ${(endOriginal - startOriginal).toFixed(2)}ms`);
console.log(`Optimized (Index): ${(endOptimizedIndex - startOptimizedIndex).toFixed(2)}ms`);
