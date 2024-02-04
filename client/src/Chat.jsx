import { useContext, useEffect, useState } from "react"
import Avatar from "./Avatar";
import Logo from "./Logo";
import { UserContext } from "./UserContext"

function Chat() {
    
    const [webs, setWebs] = useState(null);
    const [onlinePeople, setOnlinePeople] = useState({})
    const [selectedUser , setSelectedUser] = useState(null)
    const { id} = useContext(UserContext)
    useEffect(()=>{
        const webs = new WebSocket('ws://localhost:4000')
        setWebs(webs)
        webs.addEventListener('message', handleMessage)
    },[])  


    function showOnlinePeople(peopleArray){
        const people = {};

        peopleArray.forEach(({userId, username}) => {
            people[userId] = username;
            
        });

        setOnlinePeople(people)

    }

    function handleMessage(e) {
        const messageData = JSON.parse(e.data)
        if("online" in messageData){
            showOnlinePeople(messageData.online)
        }
    }


    const onlinePeopleExcludingUser = {...onlinePeople};
    delete onlinePeopleExcludingUser[id]





  return (
    <div className="flex h-screen">
      

        {/* left  */}
        <div className="bg-white w-1/3 pl-4 pt-4">
            <Logo /> 
            {Object.keys(onlinePeopleExcludingUser).map(userId =>(
                <div key={userId} onClick={()=> setSelectedUser(userId)} className={"border-b border-gry-100  flex items-center gap-3 cursor-pointer " +(userId === selectedUser ? 'bg-blue-50' : '' )}>
                    {userId === selectedUser && (
                        <div className="w-1 h-12 bg-blue-500 rounded-r-md"></div>
                    )}
                    <div className="py-2 pl-4 flex gap-2 items-center">
                        <Avatar username ={onlinePeople[userId]} userId = {userId}  />
                        <span className="text-gray-800 ">{onlinePeople[userId]}</span>
                    </div>
                    
                </div>
            ))}
        </div>

        {/* right  */}
        <div className="flex flex-col bg-blue-50 w-2/3 p-2">
            <div className="flex-grow">messages with selected person</div>
            <div className="flex gap-2">
                <input type="text"
                    placeholder="Type your message here"
                    className="bg-white border p-2 flex-grow rounded-sm"
                    
                />
                <button className="bg-blue-500 p-2 text-white rounded-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
</svg>

                </button>
            </div>
        </div>
    </div>
  )
}

export default Chat