import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Terminal as TerminalIcon, FolderTree, PanelTop } from 'lucide-react';
import MinimalSlider from './MinimalSlider';
import GlideSelect from '../GlideSelect';
import { useNavbarMode, type NavbarMode } from '../../lib/useNavbarMode';

interface TerminalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  terminalFontSize?: number;
  onTerminalFontSizeChange?: (size: number) => void;
  fileTreeFontSize?: number;
  onFileTreeFontSizeChange?: (size: number) => void;
  navbarMode?: NavbarMode;
  onNavbarModeChange?: (mode: NavbarMode) => void;
}

export default function TerminalSettingsModal({
  isOpen,
  onClose,
  terminalFontSize = 13,
  onTerminalFontSizeChange,
  fileTreeFontSize = 12,
  onFileTreeFontSizeChange,
  navbarMode: propNavbarMode,
  onNavbarModeChange: propOnNavbarModeChange,
}: TerminalSettingsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const { navbarMode: hookNavbarMode, setNavbarMode: hookSetNavbarMode } = useNavbarMode();
  const currentNavbarMode = propNavbarMode ?? hookNavbarMode;
  const handleNavbarModeChange = propOnNavbarModeChange ?? hookSetNavbarMode;

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none"
          role="dialog"
          aria-modal="true"
          aria-labelledby="terminal-settings-title"
        >
          {/* Backdrop matching SoundSettingsModal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50"
          />

          {/* Modal Panel - Clean, spacious, borderless card matching SoundSettingsModal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="relative w-full max-w-[540px] bg-[var(--surface-base)] rounded-3xl shadow-2xl shadow-black/40 z-10 text-[var(--text-main)] p-7 sm:p-8 select-none overflow-visible"
          >
            {/* Header: Title + Close (Clean, borderless) */}
            <div className="flex items-center justify-between pb-1">
              <div>
                <h2
                  id="terminal-settings-title"
                  className="text-base font-semibold tracking-tight text-[var(--text-main)]"
                >
                  Workspace & Appearance
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-main)] hover:bg-[var(--surface-subtle)] cursor-pointer transition-colors"
                aria-label="Close settings"
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Interactive Sliders Section */}
            <div className="my-7 space-y-6">
              {/* Slider 1: Terminal Font Size */}
              {onTerminalFontSizeChange && (
                <MinimalSlider
                  label="Terminal Text Size"
                  icon={<TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />}
                  value={terminalFontSize}
                  defaultValue={13}
                  min={11}
                  max={20}
                  step={1}
                  unit="px"
                  onChange={onTerminalFontSizeChange}
                  accentColor="var(--accent-primary)"
                  ariaLabel="Terminal font size"
                />
              )}

              {/* Slider 2: File Directory Font Size */}
              {onFileTreeFontSizeChange && (
                <MinimalSlider
                  label="File Text Size"
                  icon={<FolderTree className="w-3.5 h-3.5 text-blue-400" />}
                  value={fileTreeFontSize}
                  defaultValue={12}
                  min={10}
                  max={18}
                  step={1}
                  unit="px"
                  onChange={onFileTreeFontSizeChange}
                  accentColor="var(--accent-primary)"
                  ariaLabel="File directory font size"
                />
              )}
            </div>

            {/* Navigation Bar Display Mode Section */}
            <div className="mb-7 pt-5 border-t border-white/5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium flex items-center gap-1.5">
                  <PanelTop className="w-3.5 h-3.5 text-purple-400" />
                  <span>Navigation Bar</span>
                </span>
              </div>

              <GlideSelect
                options={[
                  { value: 'always', label: 'Always on', tag: 'Pinned' },
                  { value: 'hover', label: 'Hovered', tag: 'Auto-hide' },
                  { value: 'hide', label: 'Hide', tag: 'Zen' },
                ]}
                value={currentNavbarMode}
                onChange={(val) => handleNavbarModeChange(val as NavbarMode)}
                ariaLabel="Navigation bar visibility mode"
                surfaceColor="var(--surface-subtle)"
                menuSurfaceColor="var(--surface-elevated)"
                highlightColor="var(--surface-active)"
                accentColor="var(--accent-primary-soft)"
                textColor="var(--text-main)"
                size="md"
                radius={16}
                menuWidth={184}
                placement="bottom"
                align="right"
              />
            </div>

            {/* Clean borderless footer */}
            <div className="pt-2 flex items-center justify-end text-xs">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-active)] text-[var(--text-main)] transition-colors cursor-pointer font-medium"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
