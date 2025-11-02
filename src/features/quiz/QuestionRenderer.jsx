import React from 'react';
import SingleChoice from './controls/SingleChoice.jsx';
import MultipleChoice from './controls/MultipleChoice.jsx';
import SliderInput from './controls/SliderInput.jsx';
import RankedInput from './controls/RankedInput.jsx';
import TextInput from './controls/TextInput.jsx';
import MultiNumber from './controls/MultiNumber.jsx';

export default function QuestionRenderer({ question, value, onChange, error }){
  switch (question.type){
    case 'single': return <SingleChoice question={question} value={value} onChange={onChange} error={error} />;
    case 'multiple': return <MultipleChoice question={question} value={value} onChange={onChange} error={error} />;
    case 'slider': return <SliderInput question={question} value={value} onChange={onChange} error={error} />;
    case 'ranked': return <RankedInput question={question} value={value} onChange={onChange} error={error} />;
    case 'text': return <TextInput question={question} value={value} onChange={onChange} error={error} />;
    case 'multiNumber': return <MultiNumber question={question} value={value} onChange={onChange} error={error} />;
    default: return <div>Unsupported type: {question.type}</div>;
  }
}