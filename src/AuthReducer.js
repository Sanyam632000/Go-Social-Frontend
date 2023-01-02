const AuthReducer = (state,action) =>{
    switch (action.type){
        case "LOGIN_START":
            return{
                user_detail:null,
                isFetching:true,
                error:false
            };

        case "LOGIN_SUCCESS":
            return{
                user_detail:action.payload,
                isFetching:false,
                error:false
            };
        
        case "LOGIN_FAILURE":
            return{
                user_detail:null,
                isFetching:false,
                error:action.payload
            };

             
        case "FOLLOW":
            return{
             ...state,
               user_detail:{
                ...state.user_detail,
                following: [...state.user_detail.following, action.payload],
               },
            };

            case "UNFOLLOW":
            return{
             ...state,
               user_detail:{
                ...state.user_detail,
                following: state.user_detail.following.filter(followings =>followings !== action.payload)
               }
            }
        
        default:
            return state;
    }
}

export default AuthReducer;