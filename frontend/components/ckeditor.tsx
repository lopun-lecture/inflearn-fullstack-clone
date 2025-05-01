"use client";

import { useState, useEffect, useRef } from "react";

interface CKEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const CKEditor = ({ value, onChange }: CKEditorProps) => {
  const editorRef = useRef<any>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const initialValueRef = useRef(value);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const loadEditor = async () => {
      try {
        // 이전 에디터 인스턴스가 있다면 제거
        if (editorRef.current) {
          await editorRef.current.destroy();
          editorRef.current = null;
          setIsEditorReady(false);
        }

        // 동적으로 CKEditor 모듈 로드
        const ClassicEditor = (
          await import("@ckeditor/ckeditor5-build-classic")
        ).default;

        if (containerRef.current && !editorRef.current) {
          // 에디터 초기화
          const editorInstance = await ClassicEditor.create(
            containerRef.current,
            {
              licenseKey: "GPL",
              initialData: initialValueRef.current,
              toolbar: [
                "heading",
                "|",
                "bold",
                "italic",
                "link",
                "bulletedList",
                "numberedList",
                "|",
                "outdent",
                "indent",
                "|",
                "imageUpload",
                "blockQuote",
                "insertTable",
                "undo",
                "redo",
              ],
              language: "ko",
            }
          );

          // 변경 이벤트 리스너 추가
          editorInstance.model.document.on("change:data", () => {
            const data = editorInstance.getData();
            if (data !== value) {
              onChange(data);
            }
          });

          // 에디터 인스턴스 저장
          editorRef.current = editorInstance;
          setIsEditorReady(true);
        }
      } catch (error) {
        console.error("CKEditor 초기화 오류:", error);
      }
    };

    loadEditor();

    // 컴포넌트 언마운트 시 에디터 정리
    return () => {
      const cleanup = async () => {
        if (editorRef.current) {
          try {
            await editorRef.current.destroy();
            editorRef.current = null;
            setIsEditorReady(false);
          } catch (error) {
            console.error("에디터 정리 중 오류 발생:", error);
          }
        }
      };
      cleanup();
    };
  }, [isMounted]); // isMounted만 의존성으로 추가

  // 값이 외부에서 변경되면 에디터 내용 업데이트
  useEffect(() => {
    if (
      isEditorReady &&
      editorRef.current &&
      value !== editorRef.current.getData()
    ) {
      editorRef.current.setData(value);
    }
  }, [value, isEditorReady]);

  return (
    <div className="ck-editor-container">
      <div ref={containerRef} className="min-h-[300px] border p-4 rounded">
        {!isEditorReady && "에디터 로딩 중..."}
      </div>
    </div>
  );
};

export default CKEditor;
