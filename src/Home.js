import React,{useState,useEffect, useRef, useContext} from "react";
import {FaUserAlt,FaBookmark,FaQuestion,FaGraduationCap} from "react-icons/fa"
import {MdMessage,MdNotifications,MdOutlineRssFeed,MdOutlineChatBubble,MdVideocam,MdOutlineGroups,MdWorkOutline,MdEventBusy,MdPhotoSizeSelectActual,MdLocationPin,MdOutlineEmojiEmotions} from "react-icons/md"
import {BsThreeDots} from "react-icons/bs"
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthContext } from "./AuthContext";
import {io} from "socket.io-client"
import './App.css';
import ad from './ad.png'
import axios from "axios";
import { BrowserRouter as Router,Routes, Route,Link,Navigate,useNavigate } from "react-router-dom"
import {format} from "timeago.js"





const Home =() =>{

    const [posts,setPosts] = useState([]);
    const {user_detail} = useContext(AuthContext);
    const description = useRef();
    const [file,setFile] = useState(null)
    const id = user_detail._id;
    const profile_img = user_detail.profilePicture;
    const [user,setUser] = useState([]);
    const [allUsers,setAllUsers] = useState([]); 
    const [birthdayBoy,setBirthdayBoy] = useState([])
    
    

    

    /*var d = new Date();
    const monthNames = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];
  
    console.log((d.getDate()+" "+ monthNames[d.getMonth()]) )*/
    //Here in useEffect, fetchPost method store posts of send userid(in axios) in post array...It uses axios method to use postman method...
    useEffect(() => {
      const fetchPost = async() =>{
        const res = await axios.get(`http://localhost:3030/post/timeline/${id}`);
    //arrange post in ascending order according to time...
        setPosts(res.data.sort((p1,p2) =>{
        return new Date(p2.updatedAt) - new Date(p1.updatedAt)
      }))  
      }
      fetchPost();
    },[id])
  
  
    //Get Friends of the user
    useEffect(() => {
      const fetchUserFollowing =async()=>{
        const res = await axios.get(`http://localhost:3030/${id}/getfollowing`) 
        setUser(res.data)   
      }
      fetchUserFollowing();
    },[])
  
    //Get BirthDay Boy
    useEffect(()=>{
        const fetchBirthDayBoy =async()=>{
            const res = await axios.get("http://localhost:3030/get/birthday_boy")
            
            for(var i=0;i<res.data.length;i++){
                console.log(res.data[i].username)
                birthdayBoy[i] = res.data[i].username
            }
        }
        fetchBirthDayBoy()
    },[])
    //console.log(birthdayBoy)
    
   

    //Get All the user in mongo database...
    useEffect(() => {
      const fetchAllUsers = async() =>{
        const res = await axios.get("http://localhost:3030/get_all_users")
        console.log(res.data)
        setAllUsers(res.data)
      }
      fetchAllUsers();
    },[])
  
  
    //On Click Share Button...
     const submitHandler =async(e)=>{
       e.preventDefault();
      
       const newPost ={
         userId: user_detail._id,
         description:description.current.value
       }
  
       if(file){
         const data = new FormData();
         const fileName = file.name
         data.append("file",file)
         data.append("name",fileName)   
         newPost.img = fileName
        
         try{ 
            await axios.post("http://localhost:3030/post/upload",data)
            
         }catch(err){}
       }
  
       try{
          await axios.post("http://localhost:3030/post/create",newPost)   
         
          window.location.reload()
         
       }
       catch(err){}
     }
  
    return(
      
      <div className='containe'>    
  
          <div className='header'>
  
            <h1 className='h1left'> Go-Social </h1>
            <input type="text" placeholder="  Search for friend, post or video"/>   
                <ul> 
                  <li className='first'><Link to="/" className='link'>HomePage</Link></li>
                  <li><Link to="/" className='link'>TimeLine</Link></li>
                  {/*<li><Link to="/" className='link'><FaUserAlt fontSize={20}/><span className="osition-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">9</span></Link></li>*/}
                  <li><Link to="/messenger" className='link'><MdMessage fontSize={20}/> <span className="osition-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">9</span> </Link></li>
                  <li><Link to="/" className='link'><MdNotifications fontSize={25}/> <span className="osition-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">9</span> </Link></li>
                  <li><Link to={`/profile/${id}`}><img src={profile_img} className="header_image"></img></Link></li>
              </ul> 
  
          </div>                                                                                    {/*div header end*/}
  
          <div id="main">                                                                            {/*div with id main starts*/}
  
            <div className='red' >                                                                  {/*div red starts*/}
  
              <ul>
                <button className="feed"><Link to='/' className="link_2 leftbar_profile_name"> <img src={user_detail.profilePicture} className="leftbar_profile_pic"></img> {user_detail.username} </Link></button>
                <button className="feed"><Link to='/' className="link_2"> <MdOutlineChatBubble/> Chat </Link></button>
                <button className="feed"><Link to='/' className="link_2"> <MdVideocam/> Video </Link></button>
                <button className="feed"><Link to='/' className="link_2"> <MdOutlineGroups/> Groups </Link></button>
                <button className="feed"><Link to='/' className="link_2"> <FaBookmark/> Bookmarks </Link></button>
                <button className="feed"><Link to='/' className="link_2"> <FaQuestion/> Questions </Link></button>
                <button className="feed"><Link to='/' className="link_2"> <MdWorkOutline/> Jobs </Link></button>
                <button className="feed"><Link to='/' className="link_2"> <MdEventBusy/> Events </Link></button>
                <button className="feed"><Link to='/' className="link_2"> <FaGraduationCap/> Courses </Link></button>
              </ul>
              
                <button className="btn-outline">Show More</button>
                <hr/>
  
                  <ul>   
                    {allUsers.map((person) =>{
                      return(
                          <RightBar key={person._id} {...person}/>
                      )
                    })}          
                  </ul>
  
            </div>                                                                                    {/*div red ends*/}
  
  
            <div className='blue'>                                                                     {/*div blue starts*/}

              <form className="what_in_mind" onSubmit={submitHandler}>                                 {/*div what_in_mind starts inside blue*/}
                  
                <div className="trail">
                  <div className="blue_div_1">
                  <Link to={`/profile/${id}`}><img src={profile_img} className="what_in_mind_img"/></Link>
                <textarea maxLength={200} ref={description} placeholder="What's in your mind?" ></textarea>
                  </div>
                     
                    
                            
                
                <div className="div">     
  
                  <label htmlFor="file-upload" className="what_in_mind_button custom-file-upload">
                  <MdPhotoSizeSelectActual/> Photos
                  </label>
                  <input type="file" style={{display:"none"}} id="file-upload"  accept=".png,.jpg,.jpeg" onChange={(e) => setFile(e.target.files[0])} className="what_in_mind_button"></input>
                  <button className="what_in_mind_button"><MdLocationPin/> Location</button>
                  <button className="what_in_mind_button"><MdOutlineEmojiEmotions/> Feeling</button>
                  <button className="what_in_mind_button share_button" type="submit">Share</button>
  
                  </div>
                </div>
  
              </form>                                                                                    {/*div what_in_mind ends*/}
  
                {posts.map((post) =>{
                      return(
                        <Post key={post._id} {...post}/>
                      )
                    })} 
                    
            </div>                                                                                        {/*div blue ends*/}
  
  
            <div className='green' >                                                                      {/*div green starts*/}
  
              <h3 className="endbar_heading">{birthdayBoy.includes(user_detail.username)?`Happy Birthday ${user_detail.username}`:`${birthdayBoy[0]}  ${birthdayBoy.length>1? " and " + (birthdayBoy.length-1) + " other ": "" }  have Birthday today.`} </h3>

              <img src={ad} className="ad_image"></img>
              <hr className="green_hr"/>
              <h5 className="green_h5"> Friends</h5>
  
                {user.map((u) => {
                        return(
                          <EndBar key={u._id} {...u}/>
                        )
                      })} 
  
            </div>                                                                                        {/*div green ends*/}
            
          </div>                                                                                           {/*div id main ends*/}   
    
      </div>
    )
  }


  const RightBar =({profilePicture,username,_id})=>{
    return<>
         <button className="feed"><Link to={`/profile/${_id}`} className="link_3"> <img src={profilePicture} className="all_other"/> {username} </Link></button>
          </>
  }
  
  const EndBar =({profilePicture,username,_id})=>{ 
    return<>
            <button className="feed green_button"><Link to={`/profile/${_id}`} className="link_3"> <img src={profilePicture} className="all_other"/> {username} </Link></button>
          </>
  
  }

  
  const Post =({description,img,userId,updatedAt}) =>{

    //Here, useEffect get the user in axios method and is used accordingly...
    const [user,setUser] = useState([]);

    useEffect(() => {
      const fetchUser =async()=>{
        const res = await axios.get(`http://localhost:3030/${userId}`)  
        setUser(res.data[0])
        
      }
      
      fetchUser();
    },[])
 
   return<>

     <div className="post">

       <div className="post_2"> 
         <Link to={`/profile/${user._id}`}><img src={user.profilePicture} className="post_profilePicture"/></Link>
           <div>
             <Link to={`/profile/${user._id}`} className="link" ><h5 className="post_profileName">{user.username}</h5></Link>
             <h6 className="post_time">{format(updatedAt)}</h6>
             <button className="three_dot_button"><BsThreeDots className="threedot"/></button>
           </div>
       </div> 
               
       <h3 className="post_description">{description}</h3>
       <img src={img?"http://localhost:3030/image/"+img:""} className={img?"post_image":"no_image"}></img> 
                
     </div>

        </>
}

  export default Home;