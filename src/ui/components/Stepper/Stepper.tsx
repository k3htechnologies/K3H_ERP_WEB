import React, { type ReactNode } from "react";
import { Check } from "lucide-react";

export type StepperStepId = string | number;

export interface StepperStep {
  id: StepperStepId;
  label: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

interface StepperProps {
  steps: readonly StepperStep[];
  activeStep: StepperStepId;
  completedSteps?: readonly StepperStepId[];
  onStepChange?: (step: StepperStep, index: number) => void;
  ariaLabel?: string;
  className?: string;
}

const hasStep = (
  steps: readonly StepperStepId[],
  stepId: StepperStepId,
) => steps.some((id) => id === stepId);

export const Stepper: React.FC<StepperProps> = ({
  steps,
  activeStep,
  completedSteps,
  onStepChange,
  ariaLabel = "Progress",
  className = "",
}) => {
  const activeIndex = steps.findIndex((step) => step.id === activeStep);

  if (steps.length === 0) return null;

  return (
    <nav aria-label={ariaLabel} className={className}>
      <div className="overflow-x-auto pb-1">
        <ol className="flex min-w-[32rem] items-start px-2 sm:min-w-0" role="list">
          {steps.map((step, index) => {
            const isActive = step.id === activeStep;
            const isCompleted = completedSteps
              ? hasStep(completedSteps, step.id)
              : activeIndex >= 0 && index < activeIndex;
            const isInteractive = Boolean(onStepChange) && !step.disabled;

            const circleClassName = isActive || isCompleted
              ? "border-[#2F6FED] bg-[#2F6FED] text-white shadow-[0_3px_8px_rgba(47,111,237,0.24)]"
              : "border-[#E1E5EC] bg-[#F6F7F9] text-[#7D8797]";
            const labelClassName = isActive
              ? "text-[#2F6FED]"
              : isCompleted
                ? "text-[#344054]"
                : "text-[#7D8797]";

            return (
              <li
                key={String(step.id)}
                className="relative flex min-w-0 flex-1 flex-col items-center px-2 text-center"
              >
                {index < steps.length - 1 && (
                  <span
                    aria-hidden="true"
                    className={`absolute left-[calc(50%+1.5rem)] right-[calc(-50%+1.5rem)] top-[0.875rem] border-t border-dashed ${
                      isCompleted ? "border-[#8EB1FF]" : "border-[#DDE2EA]"
                    }`}
                  />
                )}

                <button
                  type="button"
                  className={`group relative z-10 flex min-w-0 flex-col items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6FED] focus-visible:ring-offset-2 ${
                    isInteractive ? "cursor-pointer" : "cursor-default"
                  } ${step.disabled ? "opacity-50" : ""}`}
                  aria-current={isActive ? "step" : undefined}
                  aria-disabled={!isInteractive}
                  disabled={!isInteractive}
                  onClick={() => onStepChange?.(step, index)}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full border text-sm font-medium transition-colors ${circleClassName}`}
                  >
                    {isCompleted ? (
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      step.icon ?? index + 1
                    )}
                  </span>
                  <span className={`mt-2 text-sm font-medium leading-5 ${labelClassName}`}>
                    {step.label}
                  </span>
                  {step.description && (
                    <span className="mt-1 max-w-48 text-sm leading-5 text-[#98A2B3]">
                      {step.description}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};

export default Stepper;
