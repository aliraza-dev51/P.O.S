export async function getProductCategories() {
    const res = await fetch(`api/productCategories`, {        
    }).then((res) => res.json());
    return res;
}