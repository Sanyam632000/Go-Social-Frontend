export const LoginStart =(userCredential) => ({
    type:"LOGIN_START"
});

export const LoginSucess =(user_detail) => ({
    type:"LOGIN_SUCCESS",
    payload: user_detail
})

export const LoginFailure =(error) => ({
    type:"LOGIN_FAILURE",
    payload:error
});

export const Follow =(userId) =>({
    type:"FOLLOW",
    payload:userId
})

export const Unfollow =(userId) =>({
    type:"UNFOLLOW",
    payload:userId
})