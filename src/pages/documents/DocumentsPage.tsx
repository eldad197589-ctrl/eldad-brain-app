/* ============================================
   FILE: DocumentsPage.tsx
   PURPOSE: DocumentsPage component
   DEPENDENCIES: react
   EXPORTS: DocumentsPage (default)
   ============================================ */
/**
 * DocumentsPage — Orchestrator (Layout Wrapper)
 *
 * FILE: DocumentsPage.tsx
 * PURPOSE: Orchestrates the document filling flow: category selection → template →
 *          field editor → preview with actions. No business logic here.
 * DEPENDENCIES: types, constants, hooks/useDocumentEditor, all sub-components
 */
import { useState, useCallback } from 'react';
import type { LetterTemplate, ViewMode, CategoryId } from './types';
import { useDocumentEditor } from './hooks/useDocumentEditor';
import { searchTemplates } from './constants';
import CategorySelector from './components/CategorySelector';
import TemplateGrid from './components/TemplateGrid';
import DocumentEditor from './components/DocumentEditor';
import DocumentPreview from './components/DocumentPreview';
import DocumentActions from './components/DocumentActions';
import FormFillerView from './components/FormFillerView';

// #region Component

/**
 * DocumentsPage — Main page for the document bot.
 * Routes between 4 views: categories, templates, editor, preview.
 */
export default function DocumentsPage() {
  // View state machine
  const [viewMode, setViewMode] = useState<ViewMode>('categories');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<LetterTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Editor hook
  const editor = useDocumentEditor(selectedTemplate);

  /** Handle category selection */
  const handleCategorySelect = useCallback((categoryId: CategoryId) => {
    setSelectedCategory(categoryId);
    setSearchQuery('');
    setViewMode('templates');
  }, []);

  /** Handle template selection */
  const handleTemplateSelect = useCallback((template: LetterTemplate) => {
    setSelectedTemplate(template);
    editor.initForm(template);
    setViewMode('editor');
  }, [editor]);

  /** Handle search from category view — if query matches, go to templates */
  const handleGlobalSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.length > 1) {
      const results = searchTemplates(query);
      if (results.length > 0 && !selectedCategory) {
        setSelectedCategory(results[0].category);
        setViewMode('templates');
      }
    }
  }, [selectedCategory]);

  /** Go back to categories */
  const handleBackToCategories = useCallback(() => {
    setViewMode('categories');
    setSelectedCategory(null);
    setSearchQuery('');
  }, []);

  /** Go back to templates */
  const handleBackToTemplates = useCallback(() => {
    setViewMode('templates');
  }, []);

  /** Go to preview */
  const handlePreview = useCallback(() => {
    setViewMode('preview');
  }, []);

  /** Start a new document (reset everything) */
  const handleNewDocument = useCallback(() => {
    setViewMode('categories');
    setSelectedCategory(null);
    setSelectedTemplate(null);
    setSearchQuery('');
  }, []);

  /** Open the Form 2279 filler */
  const handleOpenFormFiller = useCallback(() => {
    setViewMode('formFiller');
  }, []);

  return (
    <div style={{
      maxWidth: 1000, margin: '0 auto', padding: '20px 20px 80px',
      minHeight: '100vh',
    }}>
      {/* VIEW: Category Selector */}
      {viewMode === 'categories' && (
        <CategorySelector
          onSelect={handleCategorySelect}
          searchQuery={searchQuery}
          onSearchChange={handleGlobalSearch}
          onFormFiller={handleOpenFormFiller}
        />
      )}

      {/* VIEW: Template Grid */}
      {viewMode === 'templates' && selectedCategory && (
        <TemplateGrid
          category={selectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelect={handleTemplateSelect}
          onBack={handleBackToCategories}
        />
      )}

      {/* VIEW: Document Editor (Form) */}
      {viewMode === 'editor' && selectedTemplate && (
        <DocumentEditor
          template={selectedTemplate}
          formData={editor.formData}
          onFieldChange={editor.updateField}
          onBack={handleBackToTemplates}
          onPreview={handlePreview}
        />
      )}

      {/* VIEW: Document Preview + Actions */}
      {viewMode === 'preview' && selectedTemplate && (
        <div>
          <DocumentActions
            documentContent={editor.finalContent}
            subject={editor.subject}
            onBackToEditor={handleBackToTemplates}
            onNewDocument={handleNewDocument}
          />
          <DocumentPreview
            subject={editor.subject}
            content={editor.finalContent}
            date={editor.todayFormatted}
          />
          <div style={{ marginTop: 16 }}>
            <DocumentActions
              documentContent={editor.finalContent}
              subject={editor.subject}
              onBackToEditor={() => setViewMode('editor')}
              onNewDocument={handleNewDocument}
            />
          </div>
        </div>
      )}

      {/* VIEW: Form 2279 Filler */}
      {viewMode === 'formFiller' && (
        <FormFillerView onBack={handleNewDocument} />
      )}
    </div>
  );
}

// #endregion
