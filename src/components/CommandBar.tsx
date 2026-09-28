"use client";

import { SendHorizontal, Loader2, Paperclip, X, Mic, Square, AlertCircle } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import { useDiagramStore } from '@/store/useDiagramStore';
import DiagramTypeSelector, { DIAGRAM_TYPES, DiagramType } from './DiagramTypeSelector';


export default function CommandBar() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedDiagramType, setSelectedDiagramType] = useState<DiagramType | null>(null);

  const nodes = useDiagramStore(state => state.nodes);
  const storeDiagramType = useDiagramStore(state => state.diagramType);
  const setStoreDiagramType = useDiagramStore(state => state.setDiagramType);
  const isEmpty = nodes.length === 0 && !isGenerating;

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [inputValue]);

  // Sync the selected diagram type from the store (restored from DB on page load)
  useEffect(() => {
    if (storeDiagramType && storeDiagramType !== 'architecture') {
      const found = DIAGRAM_TYPES.find(dt => dt.id === storeDiagramType);
      if (found) setSelectedDiagramType(found);
    } else if (storeDiagramType === 'architecture') {
      // architecture is the default; only set pill if nodes already exist (loaded canvas)
      if (nodes.length > 0) {
        const found = DIAGRAM_TYPES.find(dt => dt.id === 'architecture');
        if (found) setSelectedDiagramType(found);
      }
    }
  // We only want this to run when the store's diagramType is first set (page load)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeDiagramType]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDiagramTypeSelect = (type: DiagramType) => {
    const newType = selectedDiagramType?.id === type.id ? null : type;
    setSelectedDiagramType(newType);
    // Persist selected type to the store so it gets saved to DB
    setStoreDiagramType(newType?.id ?? 'architecture');
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    let startValue = inputValue;

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      if (finalTranscript) {
        startValue = startValue + (startValue && !startValue.endsWith(' ') ? ' ' : '') + finalTranscript.trim();
        setInputValue(startValue + (interimTranscript ? ' ' + interimTranscript : ''));
      } else {
        setInputValue(startValue + (startValue && !startValue.endsWith(' ') && interimTranscript ? ' ' : '') + interimTranscript);
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isRecording) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsRecording(false);
    }
    if (!inputValue.trim() || isGenerating) return;

    setGenerationError(null);
    setIsGenerating(true);
    useDiagramStore.getState().setArchitectureScore(null);
    useDiagramStore.getState().setScoreReasoning(null);
    useDiagramStore.getState().setAnalysisDetails({ strengths: [], weaknesses: [], tradeoffs: [] });

    // Determine the diagram type key for the API
    const diagramTypeKey = selectedDiagramType?.id || 'architecture';

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: inputValue,
          diagramType: diagramTypeKey,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || errData.message || 'Failed to generate diagram. Please check your Gemini API key in .env.local');
      }

      const data = await response.json();

      // The API returns _nodeType telling us which React Flow node component to use
      const nodeType = data._nodeType || 'customArch';

      const reactFlowNodes = data.nodes.map((node: any) => ({
        id: node.id,
        type: nodeType,
        position: { x: 0, y: 0 },
        data: {
          // Common fields
          label: node.label,
          description: node.description,
          // Architecture-specific
          ...(nodeType === 'customArch' ? {
            category: node.category,
            icon: node.icon,
            purpose: node.purpose,
            bottleneckRisk: node.bottleneckRisk,
          } : {}),
          // Flowchart-specific
          ...(nodeType === 'flowchart' ? { shape: node.shape } : {}),
          // ER-specific
          ...(nodeType === 'erEntity' ? { attributes: node.attributes } : {}),
          // Sequence-specific
          ...(nodeType === 'sequence' ? { participantType: node.participantType } : {}),
          // BPMN-specific
          ...(nodeType === 'bpmn' ? {
            shape: node.shape,
            taskType: node.taskType,
            eventType: node.eventType,
            gatewayType: node.gatewayType,
          } : {}),
          // Conventional ER (Chen) specific
          ...(nodeType === 'erdNode' ? {
            erdType: node.erdType,
            dataType: node.dataType,
          } : {}),
        },
      }));

      const reactFlowEdges = data.edges.map((edge: any) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        animated: edge.animated !== undefined ? edge.animated : true,
        label: edge.label,
      }));

      useDiagramStore.getState().setNodes(reactFlowNodes);
      useDiagramStore.getState().setEdges(reactFlowEdges);
      useDiagramStore.getState().setArchitectureScore(data.architectureScore);
      useDiagramStore.getState().setScoreReasoning(data.scoreReasoning);
      useDiagramStore.getState().setAnalysisDetails({
        strengths: data.strengths,
        weaknesses: data.weaknesses,
        tradeoffs: data.tradeoffs,
      });

      // LR for sequence and ERD (nodes stack vertically = more compact), TB for the rest
      const layoutDirection = (diagramTypeKey === 'sequence' || diagramTypeKey === 'erd') ? 'LR' : 'TB';
      useDiagramStore.getState().applyAutoLayout(layoutDirection);
      useDiagramStore.getState().setLastGeneratedAt(Date.now());

      setInputValue('');
      setFiles([]);
    } catch (error: any) {
      console.error('CommandBar Generation Error:', error);
      setGenerationError(error?.message || 'Failed to generate diagram');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const TypePill = selectedDiagramType ? (
    <button
      type="button"
      onClick={() => setSelectedDiagramType(null)}
      className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-600/20 border border-indigo-500/40 rounded-full text-xs text-indigo-300 font-medium shrink-0 hover:bg-rose-500/15 hover:border-rose-500/40 hover:text-rose-300 transition-colors group"
      title="Remove diagram type filter"
    >
      <selectedDiagramType.icon className="w-3 h-3" />
      {selectedDiagramType.label}
      <X className="w-3 h-3 opacity-60 group-hover:opacity-100" />
    </button>
  ) : null;

  return (
    <>
      {isEmpty && (
        <DiagramTypeSelector
          selectedType={selectedDiagramType?.id ?? null}
          onSelect={handleDiagramTypeSelect}
        />
      )}

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl z-20 px-4">
        <form
          onSubmit={handleSubmit}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`bg-surface/90 backdrop-blur-md border ${isDragging ? 'border-purple-500 bg-purple-500/5' : isRecording ? 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'border-border-c'} rounded-2xl p-2 shadow-2xl flex flex-col gap-2 focus-within:border-accent transition-colors`}
        >
          {(TypePill || files.length > 0) && (
            <div className="flex flex-wrap items-center gap-2 px-2 pt-1">
              {TypePill}
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-2 border border-border-c rounded-full text-xs text-muted">
                  <span className="truncate max-w-[120px]">{file.name}</span>
                  <button type="button" onClick={() => removeFile(idx)} className="hover:text-fg transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 mb-0.5 ml-0.5 text-muted hover:text-fg hover:bg-surface-2 rounded-xl transition-colors shrink-0"
              title="Attach file"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              type="file"
              multiple
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isGenerating}
              placeholder={
                selectedDiagramType
                  ? `Describe your ${selectedDiagramType.label.toLowerCase()}...`
                  : 'Design a microservices backend...'
              }
              className="w-full bg-transparent text-fg placeholder:text-muted resize-none outline-none py-3 px-2 min-h-[48px] max-h-[200px] overflow-y-auto leading-relaxed [&::-webkit-scrollbar]:hidden disabled:opacity-50"
              rows={1}
              style={{ scrollbarWidth: 'none' }}
            />
            <div className="flex items-center gap-2 mb-0.5 mr-0.5 shrink-0">
              <button
                type="button"
                onClick={toggleRecording}
                className={`p-2 shrink-0 flex items-center justify-center transition-all ${
                  isRecording 
                    ? 'bg-zinc-800 rounded-full hover:bg-zinc-700' 
                    : 'text-zinc-400 hover:text-white'
                }`}
                title={isRecording ? 'Stop recording' : 'Start dictation'}
              >
                {isRecording ? (
                  <Square className="w-5 h-5 fill-white text-white" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>
              <button
                type="submit"
                disabled={(!inputValue.trim() && files.length === 0) || isGenerating}
                className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white rounded-xl shadow-lg hover:shadow-[0_0_15px_rgba(79,70,229,0.5)] transition-all shrink-0 flex items-center justify-center group"
                title="Generate"
              >
                {isGenerating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <SendHorizontal className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
