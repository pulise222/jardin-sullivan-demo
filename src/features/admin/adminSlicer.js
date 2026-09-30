import { createSlice } from '@reduxjs/toolkit'

const initialState = []

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    
    todoAdded(state, action) {
      const { id, text } = action.payload
      // "Mutating" update syntax thanks to Immer, and no `return` needed
      state.todos.push({
        id,
        text,
        completed: false,
      })
    },
    todoToggled(state, action) {
      // Look for the specific nested object to update.
      // In this case, `action.payload` is the default field in the action,
      // and can hold the `id` value - no need for `action.id` separately
      const matchingTodo = state.todos.find(
        (todo) => todo.id === action.payload,
      )

      if (matchingTodo) {
        // Can directly "mutate" the nested object
        matchingTodo.completed = !matchingTodo.completed
      }
    },
  },
})