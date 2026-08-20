export enum expenseOperations{
    getExpenseSumByDateRange,
    getExpenseSummaryByDateRange
}

type expenseSummaryResponse = {
    date: string
    amount: number
}

export type expenseSummaryByDate = {
    date: string
    expenses: number
}


export async function getExpenseSumByDateRange(from: Date, to: Date) {
    const query = {
        queryType: expenseOperations.getExpenseSumByDateRange,
        from: from,
        to: to,
    }
    const res = await fetch(`api/expenses`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
        cache: 'no-store'
    }).then((res) => res.json())
    return res
}

export async function getExpenseSummaryByDateRange(from: Date, to: Date) {
    const query = {
        queryType: expenseOperations.getExpenseSummaryByDateRange,
        from: from,
        to: to,
    }
    const res: expenseSummaryResponse[] = await fetch(`api/expenses`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
        cache: 'no-store'
    }).then((res) => res.json())

    const expensesSummary: expenseSummaryByDate[] = []
    const currentDate = new Date(from)
    let i = 0

    while (currentDate <= to) {
        const currentDateString = currentDate.toLocaleDateString("id")
        expensesSummary.push({
            date: currentDateString,
            expenses: 0,
        })

        while (i < res.length) {
            const orderDateString = new Date(res[i].date).toLocaleDateString("id")
            if (orderDateString === currentDateString) {
                expensesSummary[expensesSummary.length - 1].expenses += res[i].amount

                i += 1
            }
            else {
                break
            }
        }


        currentDate.setDate(currentDate.getDate() + 1)
    }

    return expensesSummary
}