import type { Meta, StoryObj } from '@storybook/react-vite'
import React, { useState } from 'react'
import { Combobox } from './index'
import { Select } from '../select'
import { Button } from '../button'
import { DirectionProvider } from '../../context/direction'
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '../dialog'

const options = Array.from({ length: 60 }, (_, i) => ({ value: String(i + 1), label: `Option ${i + 1}` }))
const meta = { title: 'Showcase/Popup scrolling', parameters: { layout: 'fullscreen' } } satisfies Meta
export default meta

function Fields() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Combobox options={options} label="Searchable options" mobileLayout="default" />
      <Select items={options} label="Select options" placeholder="Choose an option" mobileLayout="default" />
    </div>
  )
}

function Example() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [rtl, setRtl] = useState(false)
  const [bottom, setBottom] = useState(false)
  const [aligned, setAligned] = useState(false)
  return (
    <DirectionProvider dir={rtl ? 'rtl' : 'ltr'} className="p-4">
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => setRtl(!rtl)}>Toggle direction</Button>
        <Button onClick={() => setBottom(!bottom)}>Move fields {bottom ? 'up' : 'down'}</Button>
        <Button onClick={() => setAligned(!aligned)}>Select position: {aligned ? 'item-aligned' : 'popper'}</Button>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Open dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Popup scrolling</DialogTitle>
            <Fields />
          </DialogContent>
        </Dialog>
      </div>
      <div className={`flex h-[calc(100dvh-8rem)] flex-col ${bottom ? 'justify-end' : 'justify-start'}`}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Combobox options={options} label="Searchable options" mobileLayout="default" />
          <Select
            items={options}
            label="Select options"
            placeholder="Choose an option"
            position={aligned ? 'item-aligned' : 'popper'}
            mobileLayout="default"
          />
        </div>
      </div>
    </DirectionProvider>
  )
}

export const ViewportEdges: StoryObj = { render: () => <Example /> }
