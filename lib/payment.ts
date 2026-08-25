export enum paymentOperations{
    getPaymentSumByDateRange,
    getPaymentSummaryByDateRange,
}

type paymentSummaryResponse = {
    date: string
    amount: number
}

export type paymentSummaryByDate = {
    date: string
    paymentsIn: number
}

export async function getPaymentSumByDateRange(from: Date, to: Date) {
    const query = {
        queryType: paymentOperations.getPaymentSumByDateRange,
        from: from,
        to: to,
    }
    const res = await fetch(`api/payments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
        cache: 'no-store'
    }).then((res) => res.json())
    return res
}

export async function getPaymentSummaryByDateRange(from: Date, to: Date) {
    const query = {
        queryType: paymentOperations.getPaymentSummaryByDateRange,
        from: from,
        to: to,
    }
    const res: paymentSummaryResponse[] = await fetch(`api/payments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
        cache: 'no-store'
    }).then((res) => res.json())

    const paymentsSummary: paymentSummaryByDate[] = []
    const currentDate = new Date(from)
    let i = 0

    while (currentDate <= to) {
        const currentDateString = currentDate.toLocaleDateString("id")
        paymentsSummary.push({
            date: currentDateString,
            paymentsIn: 0,
        })

        while (i < res.length) {
            const orderDateString = new Date(res[i].date).toLocaleDateString("id")
            if (orderDateString === currentDateString) {
                paymentsSummary[paymentsSummary.length - 1].paymentsIn += res[i].amount

                i += 1
            }
            else {
                break
            }
        }


        currentDate.setDate(currentDate.getDate() + 1)
    }

    return paymentsSummary
}