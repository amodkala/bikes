import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import * as duckdb from '@duckdb/duckdb-wasm';
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import duckdb_wasm_next from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';
import 'xterm/css/xterm.css';

export default function DuckDBTerminal() {
    const terminalRef = useRef(null);
    const xtermRef = useRef(null);
    const duckdbRef = useRef(null);
    const inputBufferRef = useRef('');
    const fitAddonRef = useRef(null);
    const [isReady, setIsReady] = useState(false);

    // Initialize DuckDB
    useEffect(() => {
        async function initializeDuckDB() {
            try {
                // Define bundles
                const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
                    mvp: {
                        mainModule: duckdb_wasm,
                        mainWorker: mvp_worker,
                    },
                    eh: {
                        mainModule: duckdb_wasm_next,
                        // mainWorker: new URL('@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js', import.meta.url).toString(),
                        mainWorker: eh_worker
                    },
                };

                // Select appropriate bundle based on browser capabilities
                const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
                
                // Create worker and logger
                const worker = new Worker(bundle.mainWorker);
                const logger = new duckdb.ConsoleLogger();
                
                // Initialize async DuckDB instance
                const db = new duckdb.AsyncDuckDB(logger, worker);
                await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

                // Create a connection
                const conn = await db.connect();
                
                // Store references
                duckdbRef.current = { db, conn };
                setIsReady(true);
            } catch (error) {
                console.error('Error initializing DuckDB:', error);
            }
        }

        initializeDuckDB();

        return () => {
            const cleanup = async () => {
                if (duckdbRef.current) {
                    await duckdbRef.current.conn.close();
                    await duckdbRef.current.db.terminate();
                }
            };
            cleanup();
        };
    }, []);

    // Initialize xterm.js
    useEffect(() => {
        if (!isReady || !terminalRef.current) return;

        const term = new Terminal({
            cursorBlink: true,
            theme: {
                background: '#1a1b26',
                foreground: '#c0caf5',
                cursor: '#c0caf5',
                selection: '#33467C',
                black: '#15161E',
                blue: '#7aa2f7',
                cyan: '#7dcfff',
                green: '#9ece6a',
                purple: '#bb9af7',
                red: '#f7768e',
                white: '#a9b1d6',
                yellow: '#e0af68'
            }
        });

        fitAddonRef.current = new FitAddon();
        term.loadAddon(fitAddonRef.current);

        term.open(terminalRef.current);
        fitAddonRef.current.fit();

        xtermRef.current = term;

        term.writeln('DuckDB Terminal Ready');
        term.writeln('Type "help" for available commands');
        writePrompt();

        term.onData(handleTerminalData);

        const handleResize = () => {
            fitAddonRef.current?.fit();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            term.dispose();
            window.removeEventListener('resize', handleResize);
        };
    }, [isReady]);

    const writePrompt = () => {
        xtermRef.current?.write('\r\nduckdb> ');
    };

    const handleTerminalData = async (data) => {
        const term = xtermRef.current;
        if (!term) return;

        // Handle backspace
        if (data === '\u007f') {
            if (inputBufferRef.current.length > 0) {
                inputBufferRef.current = inputBufferRef.current.slice(0, -1);
                term.write('\b \b');
            }
            return;
        }

        // Handle enter key
        if (data === '\r') {
            const command = inputBufferRef.current.trim();
            term.write('\r\n');

            if (command) {
                await executeCommand(command);
            }

            inputBufferRef.current = '';
            writePrompt();
            return;
        }

        // Echo other characters and store in buffer
        term.write(data);
        inputBufferRef.current += data;
    };

    const executeCommand = async (command) => {
        const term = xtermRef.current;
        const { conn } = duckdbRef.current || {};
        
        if (!term || !conn) return;

        // Handle special commands
        if (command.toLowerCase() === 'help') {
            term.writeln('Available commands:');
            term.writeln('  help     - Show this help message');
            term.writeln('  clear    - Clear the terminal');
            term.writeln('  exit     - Exit the terminal');
            term.writeln('  Any SQL query - Execute SQL query');
            return;
        }

        if (command.toLowerCase() === 'clear') {
            term.clear();
            return;
        }

        if (command.toLowerCase() === 'exit') {
            term.writeln('Goodbye!');
            return;
        }

        // Execute SQL query
        try {
            const result = await conn.query(command);
            
            // Format and display results
            if (result && result.length > 0) {
                // Get column names from the first row
                const columns = Object.keys(result[0]);
                
                // Calculate column widths
                const columnWidths = columns.map(col => {
                    const maxDataWidth = Math.max(...result.map(row => String(row[col]).length));
                    return Math.max(maxDataWidth, col.length);
                });

                // Print header
                term.writeln(
                    columns.map((col, i) => 
                        col.padEnd(columnWidths[i])
                    ).join(' | ')
                );

                // Print separator
                term.writeln(
                    columnWidths.map(width => 
                        '-'.repeat(width)
                    ).join('-+-')
                );

                // Print rows
                result.forEach(row => {
                    term.writeln(
                        columns.map((col, i) => 
                            String(row[col]).padEnd(columnWidths[i])
                        ).join(' | ')
                    );
                });

                term.writeln(`\nReturned ${result.length} rows`);
            }
        } catch (error) {
            term.writeln(`Error: ${error.message}`);
        }
    };

    return (
        <div className="w-full h-full">
            <div 
                ref={terminalRef} 
                className="w-full h-full min-h-[400px]"
            />
        </div>
    );
}
