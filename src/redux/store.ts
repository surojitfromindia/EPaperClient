import { configureStore } from '@reduxjs/toolkit'
import OrganizationReducer from "./features/organization/organizationSlice.ts"
import customViewReducer from "./features/customView/customViewSlice.ts"

const store = configureStore({
    reducer: {
        organization: OrganizationReducer,
        customView: customViewReducer,
    },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

export default store;