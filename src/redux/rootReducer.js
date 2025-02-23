import { authReducer } from './reducer';
import { combineReducers } from "redux"; 
const rootReducer = combineReducers({
    test : authReducer
});
export default rootReducer;
