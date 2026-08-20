import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

import { orderOperations } from "@/lib/order"

export async function GET(request: Request) {
    try {
        const response = await prisma.order.findMany({
            include: {
                employee: {
                    select: {
                        name: true
                    }
                },
                customer: {
                    select: {
                        name: true
                    }
                },
                orderLine: true,
                payment: true
            },
            orderBy: {
                id: "asc",
            }
        })

        for (let order of response) {
            let orderTotal = 0
            let paymentTotal = 0

            for (let line of order.orderLine) {
                orderTotal += line.quantity * line.sellUnitPrice
            }

            for (let payment of order.payment) {
                paymentTotal += payment.amount
            }

            ;(order as any).orderTotal = orderTotal

            ;(order as any).paymentStatus =
                orderTotal - order.discount + order.rounding === paymentTotal
                    ? "Full"
                    : paymentTotal === 0
                    ? "None"
                    : "Partial"
        }

        return NextResponse.json(response)

    } catch (error) {
        console.error("GET /api/orders ERROR:", error)

        return NextResponse.json(
            {
                error: "Failed to fetch orders",
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        )
    }
}
export async function POST(request: Request) {
    const body = await request.json()

    if (body.queryType === orderOperations.getOrderCountByDateRange) {
        const orderCount = await prisma.order.count({
            where: {
                orderedDate: {
                    gte: body.from,
                    lte: body.to,
                }
            },
        })

        return NextResponse.json(orderCount)
    }
    if (body.queryType === orderOperations.getOrderRevenueByDateRange) {
        const response = await prisma.order.findMany({
            select: {
                discount: true,
                rounding: true,
                orderLine: {
                    select: {
                        quantity: true,
                        sellUnitPrice: true,
                    },
                },
            },
            where: {
                orderedDate: {
                    gte: body.from,
                    lte: body.to,
                }
            },
        })

        let orderRevenue = 0
        for (let order of response) {
            for (let orderLine of order.orderLine) {
                orderRevenue += orderLine.sellUnitPrice * orderLine.quantity
            }
            orderRevenue += (order.rounding - order.discount)
        }

        return NextResponse.json(orderRevenue)
    }
    if (body.queryType === orderOperations.getOrderIncomeByDateRange) {
        const response = await prisma.order.findMany({
            select: {
                discount: true,
                rounding: true,
                orderLine: {
                    select: {
                        quantity: true,
                        buyUnitPrice: true,
                        sellUnitPrice: true,
                    },
                },
            },
            where: {
                orderedDate: {
                    gte: body.from,
                    lte: body.to,
                }
            },
        })

        let orderIncome = 0
        for (let order of response) {
            for (let orderLine of order.orderLine) {
                orderIncome += (orderLine.sellUnitPrice - orderLine.buyUnitPrice) * orderLine.quantity
            }
            orderIncome += (order.rounding - order.discount)
        }

        return NextResponse.json(orderIncome)
    }
    if (body.queryType === orderOperations.getOrderSummaryByDateRange) {
        const response = await prisma.order.findMany({
            select: {
                orderedDate: true,
                discount: true,
                rounding: true,
                orderLine: {
                    select: {
                        quantity: true,
                        buyUnitPrice: true,
                        sellUnitPrice: true,
                    },
                },
            },
            where: {
                orderedDate: {
                    gte: body.from,
                    lte: body.to,
                }
            },
            orderBy: {
                orderedDate: "asc",
            },
        })

        return NextResponse.json(response)
    }
    if (body.queryType === orderOperations.getOrderProductsByDateRange) {
        const response = await prisma.order.findMany({
            select: {
                discount: true,
                rounding: true,
                orderLine: {
                    select: {
                        quantity: true,
                        buyUnitPrice: true,
                        sellUnitPrice: true,
                        product: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
            where: {
                orderedDate: {
                    gte: body.from,
                    lte: body.to,
                }
            },
        })

        return NextResponse.json(response)
    }
    if (body.queryType === orderOperations.getOrderById) {
        const order = await prisma.order.findUnique({
            where: {
                id: body.orderId,
            },
            include: {
                employee: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                customer: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                orderLine: {
                    include: {
                        product: {
                            select: {
                                name: true
                            }
                        }
                    }
                },
                payment: {
                    include: {
                        paymentType: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        })

        if (order) {
            let orderTotal = 0
            for (let line of order.orderLine) {
                orderTotal += line.quantity * line.sellUnitPrice
            }
            ;(order as any).orderTotal = orderTotal

            let paymentTotal = 0
            for (let payment of order.payment) {
                paymentTotal += payment.amount
            }
            ;(order as any).paymentTotal = paymentTotal

            const orderedDate = new Date(order.orderedDate)
            ;(order as any).orderedDate = orderedDate.toLocaleString("id").replaceAll(".", ":")

            const requiredDate = new Date(order.requiredDate)
            ;(order as any).requiredDate = requiredDate.toLocaleString("id").replaceAll(".", ":")

            for (let payment of order.payment) {
                const date = new Date(payment.date)
                ;(payment as any).paymentDate = date.toLocaleString("id").replaceAll(".", ":")
            }
        }
    
        return NextResponse.json(order)
    }
    if (body.queryType === orderOperations.getOrdersByDateRange) {
        const orders = await prisma.order.findMany({
            where: {
                orderedDate: {
                    gte: body.from,
                    lte: body.to,
                }
            },
            include: {
                orderLine: {
                    include: {
                        product: {
                            select: {
                                name: true,
                            }
                        }
                    }
                },
                payment: true,
            },
        })

        for (let order of orders) {
            let orderTotal = 0
            let orderIncome = 0
            for (let line of order.orderLine){
                orderTotal += line.quantity * line.sellUnitPrice
                orderIncome += line.quantity * line.buyUnitPrice
            }
            ;(order as any).orderTotal = orderTotal
            ;(order as any).orderIncome = orderIncome
    
            const orderedDate = new Date(order.orderedDate)
            ;(order as any).orderedDate = orderedDate.toLocaleDateString("id")
        }
        return NextResponse.json(orders)
    }


    if (body.queryType === orderOperations.updateOrderById) {
        const update = await prisma.order.update({
            where: {
                id: body.order.id,
            },
            data: {
                employeeId: body.order.employeeId,
                customerId: body.order.customerId,
            },
        })

        return NextResponse.json(update)
    }
}