import { createStore, applyMiddleware } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import { persistStore, persistReducer } from "redux-persist"; 
import storage from "redux-persist/lib/storage"; 
import ReduxThunk from "redux-thunk";

import allReducers from "./rootReducer";
 
const persistConfig = {

	key: "root",
	storage, 
};
const persistedReducer = persistReducer(persistConfig, allReducers); 

const store = createStore(
	persistedReducer,
	composeWithDevTools(applyMiddleware(ReduxThunk))
);

const persistor = persistStore(store); 

export { store, persistor };