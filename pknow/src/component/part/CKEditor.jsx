import { CKEditor } from "@ckeditor/ckeditor5-react";
import { useCKEditorCloud } from "@ckeditor/ckeditor5-react";
import { useState, useEffect, useMemo, useRef } from "react";

export default function Editor({
  id,
  value,
  onChange,
  onEditorChange,
  disabled,
}) {
  const cloud = useCKEditorCloud({ version: "46.0.0" });
  const [ready, setReady] = useState(false);
  const editorRef = useRef(null);
  const toolbarRef = useRef(null);

  // Generate unique ID untuk setiap instance editor
  const editorId = id || `editor-${Math.random().toString(36).substr(2, 9)}`;
  const toolbarId = `toolbar-${editorId}`;

  useEffect(() => {
    setReady(true);

    // Cleanup function
    return () => {
      if (toolbarRef.current) {
        toolbarRef.current.innerHTML = "";
      }
    };
  }, []);

  const { DecoupledEditor, editorConfig } = useMemo(() => {
    if (cloud.status !== "success" || !ready) return {};

    const {
      DecoupledEditor,
      Bold,
      Italic,
      Heading,
      Link,
      List,
      Paragraph,
      Essentials,
      FontColor,
      FontBackgroundColor,
      FontSize,
      FontFamily,
      Underline,
      Alignment,
      CodeBlock,
      Table,
      TableToolbar,
      Image,
      ImageUpload,
      ImageToolbar,
    } = cloud.CKEditor;

    return {
      DecoupledEditor,
      editorConfig: {
        toolbar: {
          items: [
            "undo",
            "redo",
            "|",
            "heading",
            "fontSize",
            "fontFamily",
            "fontColor",
            "fontBackgroundColor",
            "|",
            "bold",
            "italic",
            "underline",
            "|",
            "alignment",
            "link",
            "bulletedList",
            "numberedList",
            "|",
            "insertTable",
            "codeBlock",
          ],
        },
        plugins: [
          Essentials,
          Bold,
          Italic,
          Underline,
          Heading,
          FontColor,
          FontBackgroundColor,
          FontSize,
          FontFamily,
          Alignment,
          Link,
          List,
          Paragraph,
          CodeBlock,
          Table,
          TableToolbar,
          Image,
          ImageUpload,
          ImageToolbar,
        ],
        licenseKey:
          "eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3ODQwNzM1OTksImp0aSI6ImNlYTFmZDk5LWRiZGYtNGQ2Mi04M2QzLTgzOGVjMWIzZWQ5OSIsImxpY2Vuc2VkSG9zdHMiOlsiMTI3LjAuMC4xIiwibG9jYWxob3N0IiwiMTkyLjE2OC4qLioiLCIxMC4qLiouKiIsIjE3Mi4qLiouKiIsIioudGVzdCIsIioubG9jYWxob3N0IiwiKi5sb2NhbCJdLCJ1c2FnZUVuZHBvaW50IjoiaHR0cHM6Ly9wcm94eS1ldmVudC5ja2VkaXRvci5jb20iLCJkaXN0cmlidXRpb25DaGFubmVsIjpbImNsb3VkIiwiZHJ1cGFsIl0sImxpY2Vuc2VUeXBlIjoiZGV2ZWxvcG1lbnQiLCJmZWF0dXJlcyI6WyJEUlVQIiwiRTJQIiwiRTJXIl0sInZjIjoiMmY2NzExM2YifQ.9fZQz_xV9OM9gpKd4gDEXLk3wXsGDjVdCKja_yotjxejgQ_M5JiOzIrxR7OpVRnKzkXF5isRCFWnjwnDbbb8SA",
        placeholder: "",
      },
    };
  }, [cloud, ready]);

  const handleEditorReady = (editor) => {
    editorRef.current = editor;

    // Cari toolbar container yang spesifik untuk editor ini
    const toolbarContainer = document.querySelector(`#${toolbarId}`);

    if (toolbarContainer && editor.ui.view.toolbar.element) {
      // Bersihkan container sebelum menambahkan toolbar baru
      toolbarContainer.innerHTML = "";
      toolbarContainer.appendChild(editor.ui.view.toolbar.element);

      // Simpan reference untuk cleanup
      toolbarRef.current = toolbarContainer;
    }
  };

  const handleEditorChange = (event, editor) => {
    const data = editor.getData();

    // Support both onChange and onEditorChange props for backward compatibility
    if (onChange) {
      onChange(data);
    }
    if (onEditorChange) {
      onEditorChange(data);
    }
  };

  const handleEditorDestroy = () => {
    if (toolbarRef.current) {
      toolbarRef.current.innerHTML = "";
    }
    editorRef.current = null;
  };

  if (!DecoupledEditor || !editorConfig) {
    return <p>Loading editor...</p>;
  }

  return (
    <div className="editor-container">
      {/* Toolbar container dengan ID unik */}
      <div
        id={toolbarId}
        className="editor-toolbar"
        ref={toolbarRef}
        style={{
          border: "1px solid #ccc",
          borderBottom: "none",
          borderRadius: "4px 4px 0 0",
          padding: "5px",
          backgroundColor: "#f8f9fa",
        }}
      />

      {/* Editor container */}
      <div
        className="editor-content"
        style={{
          border: "1px solid #ccc",
          borderTop: "none",
          borderRadius: "0 0 4px 4px",
          minHeight: "200px",
        }}
      >
        <CKEditor
          editor={DecoupledEditor}
          data={value || ""}
          config={editorConfig}
          disabled={disabled}
          onReady={handleEditorReady}
          onChange={handleEditorChange}
          onDestroy={handleEditorDestroy}
        />
      </div>
    </div>
  );
}
