import type { Component } from 'solid-js';
import { createSignal, For, Switch, Match, Show, onMount } from 'solid-js';

type RadioButtonArrayProps = {
  options: string[];
  selected: string;
  onChange: (value: string) => void;
};


const RadioButtonArray: Component<RadioButtonArrayProps> = (props) => {


  // Create a signal to store the selected option
  const [selectedOption, setSelectedOption] = createSignal("Words");

  return (
    
      <For each={props.options}>
          {(option) => (
            <label>
              <input
                type="radio"
                name="option"
                value={option}
                checked={props.selected === option}
                onChange={() => props.onChange(option)}
              />
              {option}
            </label>
          )}
      </For>
    
  );

};

export default RadioButtonArray;