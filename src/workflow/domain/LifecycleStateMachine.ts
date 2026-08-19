// ==================== LIFECYCLE STATE MACHINE ====================
// Domain state machine validating ITAM Asset and CMDB CI lifecycle transitions.

export type LifecycleState =
  | 'REQUESTED'
  | 'ORDERED'
  | 'RECEIVED'
  | 'IN_STOCK'
  | 'ASSIGNED'
  | 'IN_REPAIR'
  | 'RETIRED'
  | 'DISPOSED';

export class LifecycleStateMachine {
  private static validTransitions: Record<LifecycleState, LifecycleState[]> = {
    REQUESTED: ['ORDERED', 'RETIRED'],
    ORDERED: ['RECEIVED', 'RETIRED'],
    RECEIVED: ['IN_STOCK', 'ASSIGNED'],
    IN_STOCK: ['ASSIGNED', 'RETIRED'],
    ASSIGNED: ['IN_REPAIR', 'IN_STOCK', 'RETIRED'],
    IN_REPAIR: ['IN_STOCK', 'RETIRED'],
    RETIRED: ['DISPOSED'],
    DISPOSED: [],
  };

  public static canTransition(from: LifecycleState, to: LifecycleState): boolean {
    const allowed = this.validTransitions[from] || [];
    return allowed.includes(to);
  }
}
