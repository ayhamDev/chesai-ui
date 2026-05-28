// src/lib/components/website-studio/builder/PageDialogs.tsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogClose,
} from "../../dialog";
import { Input } from "../../input";
import { Button } from "../../button";

interface PageDialogsProps {
  isAddPageOpen: boolean;
  setIsAddPageOpen: (open: boolean) => void;
  newPageSlug: string;
  setNewPageSlug: (val: string) => void;
  newPageTitle: string;
  setNewPageTitle: (val: string) => void;
  handleCreatePage: () => void;

  editingPageId: string | null;
  setEditingPageId: (id: string | null) => void;
  editPageSlug: string;
  setEditPageSlug: (val: string) => void;
  editPageTitle: string;
  setEditPageTitle: (val: string) => void;
  handleEditPage: () => void;
}

export const PageDialogs: React.FC<PageDialogsProps> = ({
  isAddPageOpen,
  setIsAddPageOpen,
  newPageSlug,
  setNewPageSlug,
  newPageTitle,
  setNewPageTitle,
  handleCreatePage,
  editingPageId,
  setEditingPageId,
  editPageSlug,
  setEditPageSlug,
  editPageTitle,
  setEditPageTitle,
  handleEditPage,
}) => {
  return (
    <>
      {/* CREATE PAGE DIALOG */}
      <Dialog
        open={isAddPageOpen}
        onOpenChange={setIsAddPageOpen}
        variant="basic"
        animation="material3"
        glass={false}
      >
        <DialogContent className="max-w-md" shape="full">
          <DialogHeader>
            <DialogTitle>Create New Page</DialogTitle>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-4 py-4">
            <Input
              label="Page Slug"
              placeholder="/about"
              value={newPageSlug}
              onChange={(e) => setNewPageSlug(e.target.value)}
              autoFocus
            />
            <Input
              label="Page Title"
              placeholder="About Us"
              value={newPageTitle}
              onChange={(e) => setNewPageTitle(e.target.value)}
            />
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button
              variant="secondary"
              onClick={handleCreatePage}
              disabled={!newPageSlug}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT PAGE DIALOG */}
      <Dialog
        open={editingPageId !== null}
        onOpenChange={(open) => !open && setEditingPageId(null)}
        variant="basic"
        animation="material3"
        glass={false}
      >
        <DialogContent className="max-w-md" shape="full">
          <DialogHeader>
            <DialogTitle>Edit Page</DialogTitle>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-4 py-4">
            <Input
              label="Page Slug"
              placeholder="/about"
              value={editPageSlug}
              onChange={(e) => setEditPageSlug(e.target.value)}
              autoFocus
            />
            <Input
              label="Page Title"
              placeholder="About Us"
              value={editPageTitle}
              onChange={(e) => setEditPageTitle(e.target.value)}
            />
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button
              variant="secondary"
              onClick={handleEditPage}
              disabled={!editPageSlug}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
