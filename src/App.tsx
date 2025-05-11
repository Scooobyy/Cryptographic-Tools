import { useState } from 'react';
import { Shield, KeyRound, Menu, Copy, Check, RefreshCw, Puzzle } from 'lucide-react';

// Caesar Cipher Functions
const caesarEncrypt = (text: string, shift: number) => {
  let result = '';
  for (let char of text) {
    if (char.match(/[a-zA-Z]/)) {
      const offset = char === char.toUpperCase() ? 65 : 97;
      result += String.fromCharCode((char.charCodeAt(0) - offset + shift + 26) % 26 + offset);
    } else {
      result += char;
    }
  }
  return result;
};

const caesarDecrypt = (text: string, shift: number) => {
  return caesarEncrypt(text, -shift);
};

// Vigenère Cipher Functions
const vigenereEncrypt = (text: string, key: string) => {
  let result = '';
  let keyIndex = 0;
  const keyLower = key.toLowerCase();

  for (let char of text) {
    if (/[a-zA-Z]/.test(char)) {
      const isUpper = char === char.toUpperCase();
      const charCode = char.toLowerCase().charCodeAt(0) - 97;
      const keyCode = keyLower[keyIndex % keyLower.length].charCodeAt(0) - 97;

      const encryptedCode = (charCode + keyCode) % 26;
      const finalChar = String.fromCharCode(encryptedCode + 97);
      result += isUpper ? finalChar.toUpperCase() : finalChar;

      keyIndex++;
    } else {
      result += char;
    }
  }

  return result;
};

const vigenereDecrypt = (text: string, key: string) => {
  let result = '';
  let keyIndex = 0;
  const keyLower = key.toLowerCase();

  for (let char of text) {
    if (/[a-zA-Z]/.test(char)) {
      const isUpper = char === char.toUpperCase();
      const charCode = char.toLowerCase().charCodeAt(0) - 97;
      const keyCode = keyLower[keyIndex % keyLower.length].charCodeAt(0) - 97;

      const decryptedCode = ((charCode - keyCode + 26) % 26);
      const finalChar = String.fromCharCode(decryptedCode + 97);
      result += isUpper ? finalChar.toUpperCase() : finalChar;

      keyIndex++;
    } else {
      result += char;
    }
  }

  return result;
};

// Playfair Cipher Helpers
const generateMatrix = (key: string) => {
  key = key.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
  const matrix = [];
  const seen = new Set();

  for (const char of key + 'ABCDEFGHIKLMNOPQRSTUVWXYZ') {
    if (!seen.has(char)) {
      seen.add(char);
      matrix.push(char);
    }
  }

  return matrix;
};

const getPosition = (matrix: string[], char: string) => {
  const index = matrix.indexOf(char);
  return [Math.floor(index / 5), index % 5];
};

const playfairEncrypt = (text: string, key: string) => {
  const matrix = generateMatrix(key);
  text = text.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
  let result = '';

  // Prepare digraphs
  let i = 0;
  while (i < text.length) {
    let a = text[i];
    let b = text[i + 1] === a || !text[i + 1] ? 'X' : text[i + 1];
    i += b === 'X' ? 1 : 2;

    const [row1, col1] = getPosition(matrix, a);
    const [row2, col2] = getPosition(matrix, b);

    if (row1 === row2) {
      result += matrix[row1 * 5 + (col1 + 1) % 5];
      result += matrix[row2 * 5 + (col2 + 1) % 5];
    } else if (col1 === col2) {
      result += matrix[((row1 + 1) % 5) * 5 + col1];
      result += matrix[((row2 + 1) % 5) * 5 + col2];
    } else {
      result += matrix[row1 * 5 + col2];
      result += matrix[row2 * 5 + col1];
    }
  }

  return result;
};

const playfairDecrypt = (text: string, key: string) => {
  const matrix = generateMatrix(key);
  text = text.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
  let result = '';

  for (let i = 0; i < text.length; i += 2) {
    const a = text[i];
    const b = text[i + 1];

    const [row1, col1] = getPosition(matrix, a);
    const [row2, col2] = getPosition(matrix, b);

    if (row1 === row2) {
      result += matrix[row1 * 5 + (col1 + 4) % 5];
      result += matrix[row2 * 5 + (col2 + 4) % 5];
    } else if (col1 === col2) {
      result += matrix[((row1 + 4) % 5) * 5 + col1];
      result += matrix[((row2 + 4) % 5) * 5 + col2];
    } else {
      result += matrix[row1 * 5 + col2];
      result += matrix[row2 * 5 + col1];
    }
  }

  return result;
};

function App() {
  const [activeTab, setActiveTab] = useState('caesar');
  const [input, setInput] = useState('');
  const [key, setKey] = useState('');
  const [shift, setShift] = useState(3);
  const [result, setResult] = useState('');
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEncryption = () => {
    if (!input) return;

    setIsProcessing(true);
    setTimeout(() => {
      let output = '';
      switch (activeTab) {
        case 'caesar':
          output = mode === 'encrypt'
            ? caesarEncrypt(input, shift)
            : caesarDecrypt(input, shift);
          break;
        case 'vigenere':
          if (!key) return;
          output = mode === 'encrypt'
            ? vigenereEncrypt(input, key)
            : vigenereDecrypt(input, key);
          break;
        case 'playfair':
          if (!key) return;
          output = mode === 'encrypt'
            ? playfairEncrypt(input, key)
            : playfairDecrypt(input, key);
          break;
      }
      setResult(output);
      setIsProcessing(false);
    }, 500);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: 'caesar', name: 'Caesar', icon: Shield },
    { id: 'vigenere', name: 'Vigenère', icon: KeyRound },
    { id: 'playfair', name: 'Playfair', icon: Puzzle },
  ];

  return (
    <div className="min-h-screen bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-800 to-gray-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Menu className="w-6 h-6" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Cryptographic Tools
          </h1>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 md:flex md:flex-row gap-2 mb-8">
          {tabs.map(({ id, name, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id);
                setResult('');
              }}
              className={`flex items-center justify-center md:justify-start gap-2 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeTab === id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-105'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden md:inline">{name}</span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-gray-700">
          <div className="space-y-6">
            {/* Mode Toggle */}
            <div className="flex bg-gray-800 rounded-lg p-1 w-fit">
              {['encrypt', 'decrypt'].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m as 'encrypt' | 'decrypt')}
                  className={`px-6 py-2 rounded-md capitalize transition-all duration-300 ${
                    mode === m
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Input Fields */}
            <div className="space-y-4">
              <div className="group">
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Enter Text
                </label>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full bg-gray-900/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                  placeholder="Enter text to encrypt/decrypt..."
                />
              </div>

              {activeTab === 'caesar' && (
                <div className="group">
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Shift Amount
                  </label>
                  <input
                    type="number"
                    value={shift}
                    onChange={(e) => setShift(Number(e.target.value))}
                    className="w-full bg-gray-900/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="25"
                  />
                </div>
              )}

              {['vigenere', 'playfair'].includes(activeTab) && (
                <div className="group">
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Key
                  </label>
                  <input
                    type="text"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    className="w-full bg-gray-900/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                    placeholder="Enter encryption key..."
                  />
                </div>
              )}

              <button
                onClick={handleEncryption}
                disabled={isProcessing}
                className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 relative ${
                  isProcessing ? 'opacity-80' : ''
                }`}
              >
                <span className={`inline-flex items-center gap-2 ${isProcessing ? 'invisible' : ''}`}>
                  {mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}
                </span>
                {isProcessing && (
                  <RefreshCw className="w-5 h-5 animate-spin absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                )}
              </button>

              {result && (
                <div className="mt-6 animate-fade-in">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Result
                    </label>
                    <button
                      onClick={handleCopy}
                      className="text-gray-400 hover:text-white transition-colors"
                      title="Copy to clipboard"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-4 font-mono break-all">
                    {result}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
