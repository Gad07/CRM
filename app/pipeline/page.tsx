'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { KanbanBoard } from '@/components/KanbanBoard';
import { DealModal } from '@/components/DealModal';
import { PipelineEditorModal } from '@/components/PipelineEditorModal';
import { CommandPalette } from '@/components/CommandPalette';
import { DealDrawer } from '@/components/DealDrawer';
import { Deal } from '@/types/crm';

export default function PipelinePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [isPipelineEditorOpen, setIsPipelineEditorOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [drawerDeal, setDrawerDeal] = useState<Deal | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [initialStageId, setInitialStageId] = useState<string | undefined>(undefined);

  const handleEditDeal = (deal: Deal) => {
    setSelectedDeal(deal);
    setInitialStageId(undefined);
    setIsDealModalOpen(true);
  };

  const handleQuickAddDeal = (stageId: string) => {
    setSelectedDeal(null);
    setInitialStageId(stageId);
    setIsDealModalOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenNewDealModal={() => {
          setSelectedDeal(null);
          setInitialStageId(undefined);
          setIsDealModalOpen(true);
        }}
        onOpenPipelineEditorModal={() => setIsPipelineEditorOpen(true)}
      />

      <div className="flex-1 p-6 overflow-hidden">
        <KanbanBoard
          searchQuery={searchQuery}
          onEditDeal={handleEditDeal}
          onQuickAddDeal={handleQuickAddDeal}
        />
      </div>

      <DealModal
        isOpen={isDealModalOpen}
        onClose={() => setIsDealModalOpen(false)}
        initialDeal={selectedDeal}
        initialStageId={initialStageId}
      />

      <PipelineEditorModal
        isOpen={isPipelineEditorOpen}
        onClose={() => setIsPipelineEditorOpen(false)}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectDeal={(deal) => setDrawerDeal(deal)}
      />

      <DealDrawer
        deal={drawerDeal}
        isOpen={!!drawerDeal}
        onClose={() => setDrawerDeal(null)}
      />
    </div>
  );
}
