import { createContext, useReducer } from "react";
import AuthReducer from "./AuthReducer";

const INITIAL_STATE = {
    user_detail:null,
    isFetching:false,
    error:false,
};

export const AuthContext = createContext(INITIAL_STATE);

export const AuthContextProvider =({children}) =>{
    const [state,dispatch] = useReducer(AuthReducer,INITIAL_STATE);

    return<>
            <AuthContext.Provider
                value={{
                    user_detail:state.user_detail,
                    isFetching: state.isFetching,
                    error: state.error,
                    dispatch
                }}
            >
                {children }
            </AuthContext.Provider>
          </>
}

