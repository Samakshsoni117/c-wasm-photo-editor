'use client';

import { useState, useEffect, useRef } from 'react';

// The interface for our WebAssembly module
interface WasmModule {
  _grayscale: (dataPtr: number, width: number, height: number) => void;
  _sepia: (dataPtr: number, width: number, height: number) => void;
  _malloc: (size: number) => number;
  _free: (ptr: number) => void;
  HEAPU8: Uint8ClampedArray;
}

declare global {
  interface Window {
    Module?: Promise<WasmModule>;
  }
}

export default function WasmEditor() {
  const [wasmModule, setWasmModule] = useState<WasmModule | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalImageData = useRef<ImageData | null>(null);

  useEffect(() => {
    const initializeWasm = async () => {
      if (window.Module) {
        const loadedModule = await window.Module;
        setWasmModule(loadedModule);
      }
    };
    const interval = setInterval(() => {
      if (window.Module) {
        clearInterval(interval);
        initializeWasm();
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setImage(img);
          const canvas = canvasRef.current;
          if (canvas) {
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0);
            originalImageData.current = ctx?.getImageData(0, 0, img.width, img.height) ?? null;
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const applyGrayscale = () => {
    if (!wasmModule || !canvasRef.current || !originalImageData.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.putImageData(originalImageData.current, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const dataPtr = wasmModule._malloc(data.length);
    wasmModule.HEAPU8.set(data, dataPtr);
    wasmModule._grayscale(dataPtr, canvas.width, canvas.height);
    const resultData = new Uint8ClampedArray(wasmModule.HEAPU8.subarray(dataPtr, dataPtr + data.length));
    const resultImageData = new ImageData(resultData, canvas.width, canvas.height);
    ctx.putImageData(resultImageData, 0, 0);
    wasmModule._free(dataPtr);
  };

  const applySepia = () => {
    if (!wasmModule || !canvasRef.current || !originalImageData.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.putImageData(originalImageData.current, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const dataPtr = wasmModule._malloc(data.length);
    wasmModule.HEAPU8.set(data, dataPtr);
    wasmModule._sepia(dataPtr, canvas.width, canvas.height);
    const resultData = new Uint8ClampedArray(wasmModule.HEAPU8.subarray(dataPtr, dataPtr + data.length));
    const resultImageData = new ImageData(resultData, canvas.width, canvas.height);
    ctx.putImageData(resultImageData, 0, 0);
    wasmModule._free(dataPtr);
  };

  return (
    <div className="p-8 bg-slate-800 rounded-lg text-white max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">C++ Photo Editor</h2>
      
      <input type="file" accept="image/*" onChange={handleImageUpload} className="mb-4 block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />

      <canvas ref={canvasRef} className="w-full h-auto rounded bg-slate-900"></canvas>

      {image && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <button onClick={applyGrayscale} disabled={!wasmModule} className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded disabled:bg-slate-500">
            {wasmModule ? 'Grayscale' : 'Loading Wasm...'}
          </button>
          <button onClick={applySepia} disabled={!wasmModule} className="w-full bg-teal-600 hover:bg-teal-700 p-3 rounded disabled:bg-slate-500">
            {wasmModule ? 'Sepia' : 'Loading Wasm...'}
          </button>
        </div>
      )}
    </div>
  );
}