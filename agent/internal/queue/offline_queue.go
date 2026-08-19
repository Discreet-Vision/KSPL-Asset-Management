package queue

import (
	"errors"
	"sync"
	"time"

	"github.com/itam/discovery-agent/pkg/schema"
)

// QueueEntry holds a queued inventory payload during network disconnections.
type QueueEntry struct {
	ID        string                  `json:"id"`
	Payload   schema.InventoryPayload `json:"payload"`
	CreatedAt time.Time               `json:"created_at"`
	Attempts  int                     `json:"attempts"`
}

// OfflineQueue manages persistent local queue storage with size limits and expiration.
type OfflineQueue struct {
	mu         sync.Mutex
	entries    []QueueEntry
	maxEntries int
}

func NewOfflineQueue(maxEntries int) *OfflineQueue {
	if maxEntries <= 0 {
		maxEntries = 100
	}
	return &OfflineQueue{
		entries:    make([]QueueEntry, 0),
		maxEntries: maxEntries,
	}
}

// Enqueue stores a payload when offline.
func (q *OfflineQueue) Enqueue(payload schema.InventoryPayload) error {
	q.mu.Lock()
	defer q.mu.Unlock()

	if len(q.entries) >= q.maxEntries {
		// Evict oldest entry
		q.entries = q.entries[1:]
	}

	q.entries = append(q.entries, QueueEntry{
		ID:        payload.Checksum,
		Payload:   payload,
		CreatedAt: time.Now().UTC(),
		Attempts:  0,
	})
	return nil
}

// Dequeue retrieves and removes the oldest pending payload.
func (q *OfflineQueue) Dequeue() (*schema.InventoryPayload, error) {
	q.mu.Lock()
	defer q.mu.Unlock()

	if len(q.entries) == 0 {
		return nil, errors.New("Offline queue is empty")
	}

	entry := q.entries[0]
	q.entries = q.entries[1:]
	return &entry.Payload, nil
}

// Size returns total items pending upload.
func (q *OfflineQueue) Size() int {
	q.mu.Lock()
	defer q.mu.Unlock()
	return len(q.entries)
}
