import React from "react";
import { Steps } from "antd";

const { Step } = Steps;

interface StepperProps {
  currentStep: number;
}

const Stepper: React.FC<StepperProps> = ({ currentStep }) => {
  return (
    <Steps current={currentStep} style={{ marginBottom: 24 }}>
      <Step title="Tip ve Dosya Seçimi" />
      <Step title="Yükleme Önizleme" />
      <Step title="Alan Eşleme" />
      <Step title="Sonuç" />
    </Steps>
  );
};

export default Stepper;
