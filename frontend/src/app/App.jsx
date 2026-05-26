import "./App.css"
import { Editor } from "@monaco-editor/react"
import {MonacoBinding} from "y-monaco"; //to connect yjs with the monaco editor
import { useRef,useMemo} from "react";
import * as Y from "yjs";
import {SocketIOProvider} from "y-socket.io";
import { useState ,useEffect} from "react";



const App = () => {

  const editorRef = useRef(null);
  const bindingRef = useRef(null);

  const [username,setUsername] = useState(() => {
    return new URLSearchParams(window.location.search).get("username") || ""
  });

  const [users,setUsers] = useState([]);
  const [isEditorReady,setIsEditorReady] = useState(false);

  const ydoc = useMemo(() => new Y.Doc(), []);

  const yText = useMemo(() => ydoc.getText("monaco"), [ydoc])

  const provider = useMemo(() => new SocketIOProvider("http://localhost:3000","monaco",ydoc,{
    autoConnect:true,
  }), [ydoc]);

  const updateUsers = (awareness) => {
    const states = Array.from(awareness.getStates().values());
    setUsers(states.filter(state => state.user && state.user.username).map(state => state.user));
  }



  const hadleMount = (editor) => {
    editorRef.current = editor;
    bindingRef.current = new MonacoBinding(
      yText,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
      provider.awareness
    )
    setIsEditorReady(true);
  }

  const handleJoin = (e) => {
    e.preventDefault();
    setUsername(e.target.username.value);
    window.history.pushState({}, "", "?username="+ e.target.username.value);

  }

  useEffect(() => {
    if(username && isEditorReady){
    const awareness = provider.awareness;

    const handleAwarenessChange = () => updateUsers(awareness);
    awareness.on("change",handleAwarenessChange)
    awareness.setLocalStateField("user", {username})

    function handleBeforeUnload() {
      awareness.setLocalStateField("user",null)
    }
    window.addEventListener("beforeunload",handleBeforeUnload);
   
    return () => {
      awareness.setLocalStateField("user",null)
      awareness.off("change",handleAwarenessChange)
      window.removeEventListener("beforeunload",handleBeforeUnload);

    }
    }
  },[username,isEditorReady,provider]);

  if(!username){
    return (
      <main className="h-screen w-screen bg-gray-900 flex items-center justify-center gap-3 p-4 ">
      <form
      onSubmit={handleJoin}
      className="flex flex-col gap-4">
          <input type="text"
           placeholder="enter username"
            className="p-2 rounded-lg bg-gray-400 text-white"

        name="username"
        />
        <button type="submit"
        className="p-2 rounded-lg bg-amber-50 text-gray-500 font-bold">
          Join
        </button>
      </form>
      </main>
    )
  }

  return (
    <main className="h-screen w-screen bg-gray-900 flex items-center justify-center gap-3 p-4">
      <aside className="h-full  w-1/4 bg-gray-400 rounded-lg ">
    <h2 className="p-4 text-2xl font-bold,border-b border-gray-300">Users</h2>
    <ul className="p-4">
        {users.map((user,index) => (
        <li key = {index} className="p-2 bg-gray-800 text-white rounded mb-2">{user.username}</li>
      ))}
    </ul>
      </aside>
      <section className="h-full w-3/4 bg-gray-400 rounded-lg ml-3 overflow-hidden">
      <Editor 
      height="100%"
      defaultLanguage="javascript"
      defaultValue="//write your code here"
      theme = "vs-dark"
      onMount={hadleMount}
      />
      </section>
    </main>
  )
}

export default App
