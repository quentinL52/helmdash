export type LeanCanvasSectionId =
  | 'Problem'
  | 'Solution'
  | 'Key Metrics'
  | 'Unique Value Proposition'
  | 'Unfair Advantage'
  | 'Channels'
  | 'Customer Segments'
  | 'Cost Structure'
  | 'Revenue Streams';

export const LEAN_CANVAS_SECTIONS: {
  id: LeanCanvasSectionId;
  title: string;
  description: string;
}[] = [
  {
    id: 'Problem',
    title: 'Problem',
    description: 'List your top 1-3 problems.',
  },
  {
    id: 'Solution',
    title: 'Solution',
    description: 'Outline a possible solution for each problem.',
  },
  {
    id: 'Key Metrics',
    title: 'Key Metrics',
    description: 'List the key numbers that tell you how your business is doing.',
  },
  {
    id: 'Unique Value Proposition',
    title: 'Unique Value Proposition',
    description:
      'A single, clear, compelling message that states why you are different and worth paying attention to.',
  },
  {
    id: 'Unfair Advantage',
    title: 'Unfair Advantage',
    description: "Something that can't be easily copied or bought.",
  },
  {
    id: 'Channels',
    title: 'Channels',
    description: 'List your path to customers.',
  },
  {
    id: 'Customer Segments',
    title: 'Customer Segments',
    description: 'List your target customers and users.',
  },
  {
    id: 'Cost Structure',
    title: 'Cost Structure',
    description: 'List your fixed and variable costs.',
  },
  {
    id: 'Revenue Streams',
    title: 'Revenue Streams',
    description: 'List your sources of revenue.',
  },
];
