import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Dropzone, type DropzoneFileItem } from './index'

const persistedFile: DropzoneFileItem = {
  id: 'document-1',
  name: 'invoice.pdf',
  size: 1024,
}

describe('Dropzone', () => {
  it('passes a controlled file to onRemove and waits for the parent to remove it', async () => {
    const onRemove = vi.fn().mockResolvedValue(undefined)
    const { rerender } = render(<Dropzone files={[persistedFile]} onDrop={vi.fn()} onRemove={onRemove} />)

    fireEvent.click(screen.getByRole('button', { name: 'Remove invoice.pdf' }))

    await waitFor(() => expect(onRemove).toHaveBeenCalledWith(persistedFile, 0))
    expect(screen.getByText('invoice.pdf')).toBeTruthy()

    rerender(<Dropzone files={[]} onDrop={vi.fn()} onRemove={onRemove} />)
    expect(screen.queryByText('invoice.pdf')).toBeNull()
  })

  it('keeps a controlled file visible and shows the error when removal fails', async () => {
    const onRemove = vi.fn().mockRejectedValue(new Error('Delete failed'))
    render(<Dropzone files={[persistedFile]} onDrop={vi.fn()} onRemove={onRemove} />)

    fireEvent.click(screen.getByRole('button', { name: 'Remove invoice.pdf' }))

    expect(await screen.findByText('Delete failed')).toBeTruthy()
    expect(screen.getByText('invoice.pdf')).toBeTruthy()
  })

  it('removes an internally managed file after onRemove succeeds', async () => {
    const onRemove = vi.fn().mockResolvedValue(undefined)
    const { container } = render(<Dropzone onDrop={vi.fn()} onRemove={onRemove} />)
    const input = container.querySelector('input[type="file"]')
    const file = new File(['contents'], 'notes.txt', { type: 'text/plain' })

    fireEvent.change(input as HTMLInputElement, { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: 'Remove notes.txt' }))

    await waitFor(() => expect(screen.queryByText('notes.txt')).toBeNull())
    expect(onRemove).toHaveBeenCalledWith(expect.objectContaining({ name: 'notes.txt', size: file.size }), 0)
  })
})
