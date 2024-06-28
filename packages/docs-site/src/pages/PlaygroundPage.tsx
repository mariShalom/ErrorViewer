import { useMemo, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { ZodErrorViewer } from "zod-error-viewer";
import { z } from "zod";
import "./PlaygroundPage.css";

export function PlaygroundPage() {
  const [dataStri, setDataStr] = useState("");
  const [errorStri, setErrorStr] = useState("");
  const [schemaStri, setSchemaStr] = useState("");

  const { data, dataParseError } = useMemo(() => {
    if (dataStri.trim().length === 0) {
      return {
        data: null,
      };
    }
    try {
      return { data: JSON.parse(dataStri) };
    } catch (err) {
      return {
        data: null,
        dataParseError: err instanceof Error ? err : new Error("Unknown error"),
      };
    }
  }, [dataStri]);

  const { schema, schemaEvalError } = useMemo(() => {
    try {
      Object.assign(window, { z });
      const schema = eval(`const z = window.z; ${schemaStri}`);
      if (!schema || !("_def" in schema)) {
        return {
          schema: null,
          schemaEvalError:
            (schemaStri || "").trim().length > 0
              ? new Error("Missing schema")
              : null,
        };
      }
      return {
        schema,
        schemaEvalError: null,
      };
    } catch (err) {
      return {
        schema: null,
        schemaEvalError:
          err instanceof Error ? err : new Error("Unknown error"),
      };
    }
  }, [schemaStri]);

  const { error, errorParseError, schemaExecuteError } = useMemo(() => {
    if (errorStri.trim().length !== 0) {
      try {
        return { error: JSON.parse(errorStri) };
      } catch (err) {
        return {
          error: undefined,
          errorParseError:
            err instanceof Error ? err : new Error("Unknown error"),
        };
      }
    }

    if (!schema) {
      return {
        error: undefined,
      };
    }

    try {
      return { error: schema.safeParse(data).error };
    } catch (err) {
      return {
        error: undefined,
        schemaExecuteError:
          err instanceof Error ? err : new Error("Unknown error"),
      };
    }
  }, [errorStri, schema, data]);

  return (
    <div className="playground">
      <h1>Playgrounds</h1>
      <div
        style={{
          display: "flex",
          gap: "8px",
          flexGrow: 0,
        }}
      >
        <section className="editor-column" aria-labelledby="data-heading">
          <div className="editor">
            <h2 id="data-heading">DATA </h2>
            <CodeMirror
              value={dataStri}
              height="300px"
              extensions={[javascript()]}
              onChange={setDataStr}
            />
          </div>
          <div id="data-error" className="error" role="alert">
            {dataParseError?.message
              ? `Failed to parse error: ${dataParseError.message}`
              : ""}
          </div>
        </section>
        <section
          className="editor-column"
          aria-labelledby="error-heading"
          aria-describedby="error-error"
        >
          <div className="editor">
            <h2 id="error-heading">
              <span style={{ verticalAlign: "middle" }}>ERROR</span>{" "}
              <span className="tag">Optional</span>
            </h2>
            <CodeMirror
              value={errorStri}
              height="300px"
              extensions={[javascript()]}
              onChange={setErrorStr}
            />
          </div>
          <div id="error-error" className="error" role="alert">
            {errorParseError?.message
              ? `Failed to parse error: ${errorParseError.message}`
              : ""}
          </div>
        </section>

        <section
          className="editor-column"
          aria-labelledby="schema-heading"
          aria-describedby="schema-eval-error"
        >
          <div className="editor">
            <h2 id="schema-heading">
              <span style={{ verticalAlign: "middle" }}>SCHEMA</span>{" "}
              <span className="tag">Optional</span>
            </h2>
            <CodeMirror
              value={schemaStri}
              height="300px"
              extensions={[javascript()]}
              onChange={setSchemaStr}
            />
          </div>
          <div id="schema-eval-error" className="error" role="alert">
            {schemaExecuteError?.message
              ? `Failed to execute schema: ${schemaExecuteError}`
              : schemaEvalError?.message
                ? `Failed to parse schema: ${schemaEvalError.message}`
                : ""}
          </div>
        </section>
      </div>
      <div className="error-viewer-container editor">
        <h2>ERROR VIEWER</h2>
        <div className="error-viewer">
          <ZodErrorViewer data={data} error={error}  />
        </div>
      </div>
    </div>
  );
}

