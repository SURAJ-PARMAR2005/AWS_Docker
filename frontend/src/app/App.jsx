import "./App.css"
import { Editor } from "@monaco-editor/react"
import {MonacoBinding} from "y-monaco"; //to connect yjs with the monaco editor
import { useRef,useMemo} from "react";
import * as Y from "yjs";
import {SocketIOProvider} from "y-socket.io";
import { useState } from "react";



const App = () => {

  const editorRef = useRef(null);

  const [username,setUsername] = useState("");

  const ydoc = useMemo(() => new Y.Doc(), []);

  const yText = useMemo(() => ydoc.getText("monaco"), [ydoc])



  const hadleMount = (editor) => {
    editorRef.current = editor;
    const provider = new SocketIOProvider("http:/localhost:3000","monaco",ydoc,{
      autoConnect:true,
    });
    const monacoBinding = new MonacoBinding(
      yText,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
      provider.awareness
    )
  }

  const handleJoin = (e) => {
    e.preventDefault();
    setUsername(e.target.username.value);
  }

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
        <button onClick={SubmitEvent}
        className="p-2 rounded-lg bg-amber-50 text-gray-500 font-bold">
          Join
        </button>
      </form>
      </main>
    )
  }

  return (
    <main className="h-screen w-screen bg-gray-900 flex items-center justify-center gap-3 p-4">
      <aside className="h-full  w-1/4 bg-gray-400 rounded-lg "></aside>
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
