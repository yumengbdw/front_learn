import { useMemo, useState } from 'react'
// useToggle切换
// true false 1. defaultValue 2. defaultValue reverseValue  3. defaultValue 'left'  'right'


export interface Actions<T> {
  setLeft: () => void;
  setRight: () => void;
  set: (value: T) => void;
  toggle: () => void;
}

function useToggle<T = boolean>(): [boolean, Actions<T>] {

}

function useToggle<T>(defaultValue: T): [T, Actions<T>];


