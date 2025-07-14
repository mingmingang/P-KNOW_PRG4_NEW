import { CKEditor } from '@ckeditor/ckeditor5-react';
import { useCKEditorCloud } from '@ckeditor/ckeditor5-react';
import { useState, useEffect, useMemo, useRef } from 'react';

export default function Editor({ value, onChange, disabled }) {
  const cloud = useCKEditorCloud({ version: '46.0.0' });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  const { DecoupledEditor, editorConfig } = useMemo(() => {
    if (cloud.status !== 'success' || !ready) return {};

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
            'undo', 'redo', '|',
            'heading', 'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', '|',
            'bold', 'italic', 'underline', '|',
            'alignment', 'link', 'bulletedList', 'numberedList', '|',
            'insertTable', 'codeBlock'
          ]
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
        licenseKey: 'eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3NTM3NDcxOTksImp0aSI6IjM4ZDIwYTY5LTE0NGEtNDVjYi1iOGRlLTQ0ZWYyNjdhYmFlMSIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiLCJzaCJdLCJ3aGl0ZUxhYmVsIjp0cnVlLCJsaWNlbnNlVHlwZSI6InRyaWFsIiwiZmVhdHVyZXMiOlsiKiJdLCJ2YyI6IjNkOGM5OTI4In0.DaDCeSwl2wqt3p3fczbAsDl7yH-2IN0ryhZ5QiyTZ4my07VRo6Ek_BQq7TPqqwTgXURWKWi9a8pEQ8lSpg2gYQ',
        placeholder: 'Masukkan pengenalan materi...',
      }
    };
  }, [cloud, ready]);

  if (!DecoupledEditor || !editorConfig) return <p>Loading editor...</p>;

  return (
    <>
      <div id="toolbar-container" />
      <CKEditor
        editor={DecoupledEditor}
        data={value}
        config={editorConfig}
        disabled={disabled}
        onReady={editor => {
          const toolbarContainer = document.querySelector('#toolbar-container');
          toolbarContainer.appendChild(editor.ui.view.toolbar.element);
        }}
        onChange={(_, editor) => {
          const data = editor.getData();
          onChange(data);
        }}
      />
    </>
  );
}
