const express = require('express')
const app = express()
const port = 3000;
app.use(express.json())

const items=[]
let id =1

app.post('/teas',(req,res)=>{
    const {name,price}=req.body;
    const newitem = {id:id++,name,price}
    items.push(newitem)
    res.status(200).send(newitem)
})

app.get("/teas",(req,res)=>{
    res.status(200).send(items)
})

app.get("/teas/:id", (req, res) => {
    const id = parseInt(req.params.id, 10);
    const item = items.find(t => t.id === id);
    if (!item) return res.status(404).send({ error: "Item not found" });
    res.status(200).send(item);
});

app.put('/teas/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { name, price } = req.body;
    const item = items.find(t => t.id === id);
    if (!item) return res.status(404).send({ error: "Item not found" });
    item.name = name;
    item.price = price;
    res.status(200).send(item);
});

app.delete('/teas/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const index = items.findIndex(t => t.id === id);
    if (index === -1) return res.status(404).send({ error: "Item not found" });
    items.splice(index, 1);
    res.status(200).send('Deleted');
});


app.listen(port,()=>{
    console.log('server runnig on port 3000')
})