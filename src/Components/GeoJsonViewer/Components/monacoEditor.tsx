import { useEffect, useMemo, useState } from 'react';
import { EditorProps, Editor, OnChange, OnMount, BeforeMount, useMonaco } from '@monaco-editor/react';
import { LinearProgress } from '@map-colonies/react-core';
import { editor, Uri } from 'monaco-editor';
// import * as monaco from 'monaco-editor';
import 'monaco-editor/esm/vs/language/json/monaco.contribution';
import { SchemaObject } from 'ajv';
import { FEATURE_ID_FIELD } from '../Utils/GeoJsonViewer/utils';

type MonacoEditorProps = EditorProps & { codeText?: string, readonly?: boolean; isFetching?: boolean; schema?: SchemaObject; onSelectGeometry?: (key: string) => void; };

export const MonacoEditor: React.FC<MonacoEditorProps> = (editorProps) => {
  const { schema, readonly = false, isFetching = false, onChange, codeText, onSelectGeometry } = editorProps;
  const [loadProgressBar, setLoadProgressBar] = useState<boolean>(false);
  const [code, setCode] = useState<string>('');

  const monaco = useMonaco();
  //   const { isDarkMode } = useTheme();
  const isDarkMode = false;

  const options: editor.IStandaloneEditorConstructionOptions = {
    readOnly: readonly,
  };

  useEffect(() => {
    setCode(codeText as string);
  }, [codeText]);


  const diagnosticOptions = useMemo(() => {
    if (!schema) {
      return {};
    }

    const options = {
      validate: true,
      allowComments: false,
      trailingCommas: 'error',
      schemas: [
        {
          uri: schema.$id ?? 'UNKNOWN',
          schema: schema,
          fileMatch: ['*'],
        },
      ],
      schemaValidation: 'error',
    };
    return options;
  }, [schema]);

  useEffect(() => {
    if (!monaco) {
      return;
    }
    monaco.json.jsonDefaults.setDiagnosticsOptions(diagnosticOptions);

    return () => {};
  }, [monaco, diagnosticOptions]);

  const handleCodeChange: OnChange = (value: string | undefined, ev: editor.IModelContentChangedEvent) => {
    const localCode = value ?? '';
    const model = monaco?.editor.getModel(schema?.$id as unknown as Uri);
    const markers = monaco?.editor
      .getModelMarkers({ resource: model?.uri })
      .filter(m =>
        m.severity === monaco.MarkerSeverity.Error &&
        m.owner === 'json'
      );
    setCode(localCode);
    try {
      const parsedJson = JSON.parse(localCode);
      if (onChange && (markers?.length === 0 || parsedJson)) {
        onChange(localCode, ev);
      }
    } catch {
      console.log('****** JSON not valid, current markers are:', markers);
    }
  };

  const editorDidMount: OnMount = (editor) => {
    editor.onMouseMove((e) => {
      if (e.target && e.target.position) {
        const { lineNumber, column } = e.target.position;
        const model = editor.getModel();
        
        const lineContent = model?.getLineContent(lineNumber);
        const regex = new RegExp(`"${FEATURE_ID_FIELD}":\\s*"(.*)"`);// /"id":\s*"(.*)"/;
        const match = lineContent?.match(regex);

        if (match) {
          const featureId = match[1];
          onSelectGeometry?.(featureId);
          // setHoveredFeatureId(featureId);
          console.log(`Hovered over feature with id: ${featureId}`);
        } else {
          // setHoveredFeatureId(null);
          onSelectGeometry?.('');
        }
      }
    });

    setLoadProgressBar(false);
    editor.focus();
  };

  const handleBeforeMount: BeforeMount = () => {
    setLoadProgressBar(true);
  };

  return (
    <>
      {loadProgressBar && <LinearProgress value={100} variant={isFetching ? 'indeterminate' : 'determinate'} />}
      <Editor
        width={'100%'}
        defaultLanguage={'json'}
        theme={isDarkMode ? 'vs-dark' : 'light'}
        value={code}
        options={options}
        {...editorProps}
        onChange={handleCodeChange}
        onMount={editorDidMount}
        beforeMount={handleBeforeMount}
      />
    </>
  );
};