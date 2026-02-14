import { Hypothesis, HypothesisStatus } from '@/store/founder-store';
import { HypothesisCard } from './hypothesis-card';

interface HypothesisColumnProps {
    column: { id: HypothesisStatus; title: string };
    hypotheses: Hypothesis[];
    onEdit: (hypothesis: Hypothesis) => void;
    color: string;
}

export function HypothesisColumn({ column, hypotheses, onEdit, color }: HypothesisColumnProps) {
    return (
        <>
            {hypotheses.map((hypothesis) => (
                <HypothesisCard
                    key={hypothesis.id}
                    hypothesis={hypothesis}
                    onEdit={onEdit}
                    color={color}
                />
            ))}
        </>
    );
}
