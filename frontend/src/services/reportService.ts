import reportsMock from '../mocks/reports.json';

export interface SalesReportItem {
    time?: string;
    date?: string;
    month?: string;
    sales: number;
}

export interface CashFlowItem {
    no: number;
    description: string;
    income: number;
    outcome: number;
}

export interface SalesTableItem {
    date: string;
    profit: number;
    revenue: number;
}

export interface TransactionItem {
    id: string;
    invoiceNo: string;
    date: string;
    customer: string;
    cashbox: string;
    category: string;
    items: { name: string; qty: number; price: number }[];
    subtotal: number;
    discount: number;
    grandTotal: number;
}

// Transaction data is partially handled in transactionService, but reports might need historical data.
// For now, we'll use mock data as per Figma.

const USE_MOCK_DATA = true;

export const getSalesReport = async (period: 'daily' | 'monthly' | 'yearly'): Promise<{ success: boolean; data: SalesReportItem[] }> => {
    if (USE_MOCK_DATA) {
        return { success: true, data: (reportsMock.salesReport as any)[period] };
    }
    // TODO: Implement actual API call
    return { success: false, data: [] };
};

export const getCashFlow = async (period: 'daily' | 'monthly' | 'yearly'): Promise<{ success: boolean; data: CashFlowItem[] }> => {
    if (USE_MOCK_DATA) {
        return { success: true, data: (reportsMock.cashFlow as any)[period] };
    }
    return { success: false, data: [] };
};

export const getSalesTable = async (period: 'daily' | 'monthly' | 'yearly'): Promise<{ success: boolean; data: SalesTableItem[] }> => {
    if (USE_MOCK_DATA) {
        return { success: true, data: (reportsMock.salesTable as any)[period] };
    }
    return { success: false, data: [] };
};

export const getTransactionReportData = async (): Promise<{ success: boolean; data: TransactionItem[] }> => {
    if (USE_MOCK_DATA) {
        // Using common transactions or persistent one from localStorage if we want it real.
        // For now, let's use the ones in Figma as base.
        const stored = localStorage.getItem('eljo_transactions_history');
        if (stored) {
            return { success: true, data: JSON.parse(stored) };
        }

        const mockTransactions: TransactionItem[] = [
            {
                id: '1',
                invoiceNo: 'INV-2026-0001',
                date: '2026-02-23 09:15:00',
                customer: 'John Doe',
                cashbox: 'Cashbox 1 - Main Counter',
                category: 'Layanan',
                items: [
                    { name: 'LCD iPhone X', qty: 1, price: 500000 },
                    { name: 'Pasang LCD', qty: 1, price: 250000 },
                ],
                subtotal: 750000,
                discount: 0,
                grandTotal: 750000,
            },
            {
                id: '2',
                invoiceNo: 'INV-2026-0002',
                date: '2026-02-23 10:30:00',
                customer: 'Jane Smith',
                cashbox: 'Cashbox 1 - Main Counter',
                category: 'Produk',
                items: [
                    { name: 'Baterai iPhone 11', qty: 1, price: 250000 },
                ],
                subtotal: 250000,
                discount: 10000,
                grandTotal: 240000,
            }
        ];
        return { success: true, data: mockTransactions };
    }
    return { success: false, data: [] };
};
