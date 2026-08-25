export async function getCustomers() {
    const res = await fetch(`api/customers`, {
        cache: 'no-store'
    }).then((res) => res.json());
    return res;
}