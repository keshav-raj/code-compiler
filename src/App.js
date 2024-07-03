import React, { useState, useRef } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import axios from "axios";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";

const CustomSelect = styled(Select)({
  backgroundColor: "white",
  color: "black",
  "& .MuiSelect-icon": {
    color: "black",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "white",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "white",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "white",
  },
});

const LanguageSelect = (props) => {
  const [languages, setLanguages] = useState([]);

  React.useEffect(() => {
    axios
      .get(
        "https://code-execution.learnyst.com/api/v2/runtimes",

        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        const { data } = res;
        if (data) {
          const temp = [];
          data.forEach((language, index) => {
            temp.push({
              id: index,
              language: language.language,
              version: language.version,
            });
          });
          setLanguages(temp);
        }
      });
  }, []);

  return (
    <div style={{ width: "200px" }}>
      <FormControl fullWidth size='small'>
        <InputLabel id='demo-simple-select-label'>Language</InputLabel>
        <CustomSelect
          labelId='demo-simple-select-label'
          id='demo-simple-select'
          label='Language'
          onChange={(e) => {
            props.onLanguageSelect(languages[e.target.value]);
          }}
        >
          {languages.map((language) => {
            return <MenuItem value={language.id}>{language.language}</MenuItem>;
          })}
        </CustomSelect>
      </FormControl>
    </div>
  );
};

function App() {
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState("");
  const [error, setError] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [version, setVersion] = useState("20.11.1");

  const editorRef = useRef(null);

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
  }

  const onLanguageSelect = (selectedLanguage) => {
    if (selectedLanguage) {
      setLanguage(selectedLanguage.language);
      setVersion(selectedLanguage.version);
    }
  };

  const executeCode = async () => {
    const code = editorRef.current.getValue();
    setIsLoading(true);
    try {
      const response = await axios.post(
        "https://code-execution.learnyst.com/api/v2/execute",
        {
          language: language,
          version: version,
          files: [
            {
              name: "main",
              content: code,
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setIsLoading(false);
      const { run } = response.data;
      setError(run.stderr || "");
      setOutput(run.stdout || "");
    } catch (error) {
      setIsLoading(false);

      console.error("Error:", error);
      setOutput(`Error: ${error.message}`);
    }
  };

  return (
    <div style={{ backgroundColor: "#1e1e1e" }}>
      <AppBar
        position='static'
        enableColorOnDark
        sx={{ backgroundColor: "#26592a" }}
      >
        <Toolbar>
          <Typography variant='h6' sx={{ flexGrow: 1 }}>
            Learnyst Code Editor
          </Typography>
          <div style={{ paddingBottom: "10px", paddingRight: "10px" }}>
            <button
              className='button'
              disabled={isLoading}
              onClick={executeCode}
            >
              {isLoading ? "Executing..." : "Execute"}
            </button>
          </div>
          <LanguageSelect onLanguageSelect={onLanguageSelect} />
        </Toolbar>
      </AppBar>
      <Container
        maxWidth='xl'
        style={{
          height: "calc(100vh - 64px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ display: "flex", flexGrow: 1 }}>
          <Box sx={{ flexGrow: 1, padding: 2 }}>
            <Editor
              height={"100%"}
              theme='vs-dark'
              defaultLanguage='javascript'
              defaultValue="// let's write some broken code 😈"
              language={language}
              onMount={handleEditorDidMount}
              autoIndent
            />
          </Box>
          <Box
            sx={{
              width: "30%",
              display: "flex",
              flexDirection: "column",
              padding: 2,
            }}
          >
            <Box
              sx={{
                flexGrow: 1,
                backgroundColor: "#282c34",
                color: "white",
                padding: 2,
                overflowY: "auto",
              }}
            >
              <Typography variant='h6'>Console</Typography>
              <pre>
                {output ||
                  'Nothing to console try,\nconsole.log("Hello world!")'}
              </pre>
            </Box>
            <Box
              sx={{
                flexGrow: 1,
                backgroundColor: "#282c34",
                color: error ? "red" : "white",
                padding: 2,
                overflowY: "auto",
                marginTop: "10px",
              }}
            >
              <Typography variant='h6'>Error</Typography>
              <pre>
                {error ||
                  "Ha ha! No errors here.\nLet’s crash with some spectacularly faulty code!"}
              </pre>
            </Box>
          </Box>
        </Box>
      </Container>
    </div>
  );
}

export default App;
