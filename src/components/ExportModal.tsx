"use client";

import { useState } from 'react';
import { useDiagramStore } from '@/store/useDiagramStore';
import { X, Copy, Download, Image as ImageIcon, FileCode, FileText } from 'lucide-react';
import { toPng } from 'html-to-image';
import { getViewportForBounds, useReactFlow } from '@xyflow/react';

export default function ExportModal() {
  const { isExportModalOpen, setIsExportModalOpen, nodes, architectureScore, scoreReasoning, strengths, weaknesses } = useDiagramStore();
  const [activeTab, setActiveTab] = useState<'docker' | 'spec' | 'image'>('docker');
  const { getNodes, getNodesBounds } = useReactFlow();

  if (!isExportModalOpen) return null;

  // Generate Docker Compose content
  const generateDockerCompose = () => {
    let yaml = `version: '3.8'\n\nservices:\n`;
    
    const relevantNodes = nodes.filter(n => 
      n.data.category === 'database' || n.data.category === 'infrastructure' || n.data.category === 'backend'
    );

    if (relevantNodes.length === 0) {
      yaml += `  # No backend, database, or infrastructure services detected in diagram.\n`;
    }

    relevantNodes.forEach(node => {
      const name = node.data.label.toLowerCase().replace(/[^a-z0-9]/g, '-');
      yaml += `  ${name}:\n`;
      
      // Basic educated guesses based on name
      if (name.includes('postgres') || name.includes('db')) {
        yaml += `    image: postgres:15-alpine\n`;
        yaml += `    environment:\n      POSTGRES_USER: user\n      POSTGRES_PASSWORD: password\n`;
        yaml += `    ports:\n      - "5432:5432"\n`;
        yaml += `    volumes:\n      - ${name}_data:/var/lib/postgresql/data\n`;
      } else if (name.includes('redis') || name.includes('cache')) {
        yaml += `    image: redis:7-alpine\n`;
        yaml += `    ports:\n      - "6379:6379"\n`;
      } else {
        yaml += `    image: ${name}:latest\n`;
        yaml += `    build: ./${name}\n`;
        yaml += `    ports:\n      - "8080:8080"\n`;
      }
      yaml += `\n`;
    });

    const hasVolumes = relevantNodes.some(n => n.data.label.toLowerCase().includes('postgres') || n.data.label.toLowerCase().includes('db'));
    if (hasVolumes) {
      yaml += `volumes:\n`;
      relevantNodes.forEach(node => {
        const name = node.data.label.toLowerCase().replace(/[^a-z0-9]/g, '-');
        if (name.includes('postgres') || name.includes('db')) {
          yaml += `  ${name}_data:\n`;
        }
      });
    }

    return yaml;
  };

  // Generate Architecture Markdown content
  const generateSystemSpec = () => {
    let md = `# Architecture System Specification\n\n`;
    
    if (architectureScore !== null) {
      md += `## System Health\n`;
      md += `- **Score**: ${architectureScore}/100\n`;
      md += `- **Reasoning**: ${scoreReasoning || 'N/A'}\n\n`;
      
      if (strengths.length > 0) {
        md += `### Key Strengths\n`;
        strengths.forEach(s => md += `- ${s}\n`);
        md += `\n`;
      }
      if (weaknesses.length > 0) {
        md += `### Key Weaknesses\n`;
        weaknesses.forEach(w => md += `- ${w}\n`);
        md += `\n`;
      }
    }

    md += `## Components\n\n`;
    
    const categories = ['frontend', 'backend', 'database', 'ai', 'infrastructure'];
    
    categories.forEach(cat => {
      const catNodes = nodes.filter(n => n.data.category === cat);
      if (catNodes.length > 0) {
        md += `### ${cat.charAt(0).toUpperCase() + cat.slice(1)}\n\n`;
        catNodes.forEach(node => {
          md += `#### ${node.data.label}\n`;
          if (node.data.description) md += `${node.data.description}\n\n`;
          if (node.data.purpose) md += `- **Purpose**: ${node.data.purpose}\n`;
          if (node.data.bottleneckRisk) md += `- **Bottleneck Risk**: ${node.data.bottleneckRisk}\n`;
          md += `\n`;
        });
      }
    });

    return md;
  };

  const dockerContent = generateDockerCompose();
  const specContent = generateSystemSpec();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleDownloadText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadImage = () => {
    const nodesBounds = getNodesBounds(getNodes());
    const imageWidth = 1920; // Force full HD width
    const imageHeight = 1080; // Force full HD height

    // Mathematically calculate the perfect center and zoom level
    const viewport = getViewportForBounds(
      nodesBounds,
      imageWidth,
      imageHeight,
      0.5, // min zoom
      2,   // max zoom
      0.2  // padding around the edges
    );

    const viewportEl = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!viewportEl) return;

    toPng(viewportEl, {
      backgroundColor: '#09090b',
      width: imageWidth,
      height: imageHeight,
      pixelRatio: 2, // High resolution
      style: {
        width: `${imageWidth}px`,
        height: `${imageHeight}px`,
        // Apply the calculated math to perfectly frame the graph
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
      },
    }).then((dataUrl) => {
      const link = document.createElement('a');
      link.download = 'architecture-diagram.png';
      link.href = dataUrl;
      link.click();
    }).catch((err) => {
      console.error('Error generating image', err);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800/60 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Download className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-100 tracking-tight">Export Architecture</h2>
              <p className="text-xs text-zinc-400">Generate implementation files and diagrams.</p>
            </div>
          </div>
          <button 
            onClick={() => setIsExportModalOpen(false)}
            className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-5 pt-4 gap-4 border-b border-zinc-800/60 bg-zinc-900/30">
          <button
            onClick={() => setActiveTab('docker')}
            className={`pb-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'docker' ? 'border-blue-500 text-blue-400' : 'border-transparent text-zinc-400 hover:text-zinc-300'
            }`}
          >
            <FileCode className="w-4 h-4" />
            Docker Compose
          </button>
          <button
            onClick={() => setActiveTab('spec')}
            className={`pb-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'spec' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-zinc-400 hover:text-zinc-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            System Spec
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`pb-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'image' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-zinc-400 hover:text-zinc-300'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Image Export
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-[#0a0a0c] p-6">
          
          {activeTab === 'docker' && (
            <div className="flex flex-col h-full gap-4">
              <p className="text-sm text-zinc-400">Generated <code className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">docker-compose.yml</code> based on your backend and database nodes.</p>
              <div className="relative flex-1 group">
                <pre className="h-full bg-[#121214] border border-zinc-800/80 rounded-xl p-4 overflow-auto text-xs text-zinc-300 font-mono leading-relaxed shadow-inner">
                  {dockerContent}
                </pre>
              </div>
              <div className="flex justify-end gap-3 mt-2 shrink-0">
                <button onClick={() => handleCopy(dockerContent)} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium rounded-lg transition-colors border border-zinc-700/50">
                  <Copy className="w-4 h-4" /> Copy to Clipboard
                </button>
                <button onClick={() => handleDownloadText(dockerContent, 'docker-compose.yml')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                  <Download className="w-4 h-4" /> Download YAML
                </button>
              </div>
            </div>
          )}

          {activeTab === 'spec' && (
            <div className="flex flex-col h-full gap-4">
              <p className="text-sm text-zinc-400">Generated <code className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">ARCHITECTURE.md</code> with system health and component details.</p>
              <div className="relative flex-1 group">
                <pre className="h-full bg-[#121214] border border-zinc-800/80 rounded-xl p-4 overflow-auto text-xs text-zinc-300 font-mono leading-relaxed shadow-inner">
                  {specContent}
                </pre>
              </div>
              <div className="flex justify-end gap-3 mt-2 shrink-0">
                <button onClick={() => handleCopy(specContent)} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium rounded-lg transition-colors border border-zinc-700/50">
                  <Copy className="w-4 h-4" /> Copy to Clipboard
                </button>
                <button onClick={() => handleDownloadText(specContent, 'ARCHITECTURE.md')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                  <Download className="w-4 h-4" /> Download Markdown
                </button>
              </div>
            </div>
          )}

          {activeTab === 'image' && (
            <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
              <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                <ImageIcon className="w-10 h-10 text-emerald-400" />
              </div>
              <div className="max-w-md">
                <h3 className="text-lg font-medium text-zinc-200 mb-2">Export Diagram to PNG</h3>
                <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                  Save a high-resolution image of your current canvas. Backgrounds and visual states (including failure simulations) will be preserved exactly as shown.
                </p>
                <button 
                  onClick={handleDownloadImage}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                >
                  <Download className="w-4 h-4" /> Export High-Res PNG
                </button>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
