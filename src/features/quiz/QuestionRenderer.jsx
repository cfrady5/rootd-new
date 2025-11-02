import React from 'react';
import SingleChoice from './controls/SingleChoice.jsx';
import SliderInput from './controls/SliderInput.jsx';

export default function QuestionRenderer({ question, value, onChange, error }){
  switch (question.type){
    case 'single': return <SingleChoice question={question} value={value} onChange={onChange} error={error} />;
    case 'slider': return <SliderInput question={question} value={value} onChange={onChange} error={error} />;
    default: return <div>TODO control for {question.type}</div>;
  }
}