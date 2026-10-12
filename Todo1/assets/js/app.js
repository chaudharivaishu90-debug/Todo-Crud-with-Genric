var cl = console.log;

const Base_url = "https://xhrcrud-default-rtdb.firebaseio.com";
const Menu_url = `${Base_url}/Menu.json`;

const form = document.getElementById("form");
const Item = document.getElementById("Item");
const Price = document.getElementById("Price");
const Image = document.getElementById("Image");
const Add = document.getElementById("Add");
const Update = document.getElementById("Update");
const MenuContainer = document.getElementById("MenuContainer");
const spinner = document.getElementById("spinner");

// Local state
let state = {
    FoodArr: [],
    Edit_id: null
};

// Spinner
function Spinnerhandler() {
    spinner.classList.toggle("d-none");
}

// Snackbar
function snackBar(msg, icon) {
    Swal.fire({
        text: msg,
        icon: icon,
        timer: 2500,
        showConfirmButton: false
    });
}

// Make API call
// MakeApi call fun
function MakeApi(url,method,msgbody=null){
   let  body= msgbody? JSON.stringify(msgbody) : null
   return fetch(url,{
    method:method,
    body:body,
    headers:{
        "Content-Type": "Application/json",
      "Security": "JWT Token"
    
    }
   })
   .then(res=>{
    if(!res.ok){
        throw new Error(`ERROR:${res.status}`);
        
    }
    return res.json();

   })
   .catch((err)=>{
    cl(err)

   })
   .finally(()=>{
    Spinnerhandler();

   })
}

// Render cards
function Rendering(arr) {
    let result = "";

    arr.forEach(ele => {
        result += `
            <div class="col-md-3 mb-4" id="${ele.id}">
                <div class="card my-card h-100">

                    <div class="card-header">
                        <p><b>${ele.item}</b></p>
                        <span>Price: ₹${ele.price}</span>
                    </div>

                    <div class="card-body">
                        <img
                            class="my-menu img-fluid"
                            src="${ele.image}"
                            alt="${ele.item}">

                        <div class="d-flex justify-content-between icon mt-3">
                            <i
                                class="fa-solid fa-pen-to-square fa-2x text-primary"
                                onclick="onEdit(this)">
                            </i>

                            <i
                                class="fa-solid fa-trash fa-2x text-danger"
                                onclick="onDelete(this)">
                            </i>
                        </div>
                    </div>

                </div>
            </div>
        `;
    });

    MenuContainer.innerHTML = result;
}

// Read data
function Readdata() {
    Spinnerhandler();

    MakeApi(Menu_url, "GET")
        .then(data => {
            state.FoodArr = [];

            if (data) {
                for (const key in data) {
                    data[key].id = key;
                    state.FoodArr.unshift(data[key]);
                }
            }

            Rendering(state.FoodArr);
        })
        .catch(err => {
            cl(err);
            
        })
        }

Readdata();

// Create menu
function Oncreate(eve) {
    eve.preventDefault();

    
    let obj = {
        item: Item.value.trim(),
        image: Image.value.trim(),
        price: Price.value.trim()
    };

    Spinnerhandler();

    MakeApi(Menu_url, "POST", obj)
        .then(data => {
            obj.id = data.name;

            state.FoodArr.unshift(obj);

            let div=document.createElement("div");
            div.className="col-md-3 mb-4"
            div.innerHTML=`<div class="card my-card h-100">

                    <div class="card-header">
                        <p><b>${obj.item}</b></p>
                        <span>Price: ₹${obj.price}</span>
                    </div>

                    <div class="card-body">
                        <img
                            class="my-menu img-fluid"
                            src="${obj.image}"
                            alt="${obj.item}">

                        <div class="d-flex justify-content-between icon mt-3">
                            <i
                                class="fa-solid fa-pen-to-square fa-2x text-primary"
                                onclick="onEdit(this)">
                            </i>

                            <i
                                class="fa-solid fa-trash fa-2x text-danger"
                                onclick="onDelete(this)">
                            </i>
                        </div>
                    </div>

                </div>
            `
            MenuContainer.prepend(div);
            form.reset();

            snackBar("Menu added successfully!", "success");
            
        })
        .catch(err => {
            cl(err);
        })
        
}






// edit
function onEdit(eve){
    let Edit_id=eve.closest(".col-md-3").id
    state.Edit_id=Edit_id;
    let Edobj=state.FoodArr.find(t=>t.id===Edit_id);
     Item.value=Edobj.item;
        Price.value=Edobj.price;
        Image.value=Edobj.image
         Add.classList.add("d-none");
         Update.classList.remove("d-none");
}



// update
function UpdateMenu(ele){
    Spinnerhandler();
let Update_id=state.Edit_id;
let upobj={
     item: Item.value.trim(),
        image: Image.value.trim(),
        price: Price.value.trim(),
        id:Update_id
    }
    let update_url=`${Base_url}/Menu/${Update_id}.json`
    MakeApi(update_url,"PATCH",upobj)
.then(data=>{
    let index=state.FoodArr.findIndex(t=>t.id===Update_id)
    state.FoodArr[index]=upobj;
    let div=document.getElementById(Update_id);
    div.querySelector("p").innerText == upobj.Item;
div.querySelector("span").innerText = `Price: ₹${upobj.price}`;        
div.querySelector(".my-menu").src = upobj.image;     
Add.classList.remove("d-none");
         Update.classList.add("d-none");
                snackBar("Menu Updated successfully!", "success");

         form.reset();





})
.catch(err=>{
    cl(err)
})

}






// delete

function onDelete(eve){
    let Remove_id=eve.closest(".col-md-3").id
    Swal.fire({
  title: "Are you sure?",
  text: "You won't be able to revert this!",
  icon: "warning",
  showCancelButton: true,
  confirmButtonColor: "#3085d6",
  cancelButtonColor: "#d33",
  confirmButtonText: "Yes, delete it!"
}).then((result) => {
  if (result.isConfirmed){
    Spinnerhandler();
    let Remove_url=`${Base_url}/Menu/${Remove_id}.json`
    MakeApi(Remove_url,"DELETE")
    .then(data=>{
        let index= state.FoodArr.findIndex(t=>t.id===Remove_id)
        state.FoodArr.splice(index,1)
        eve.closest(".col-md-3").remove();
        snackBar("Menu Removed!!!","success")

        

    })
    .catch(err=>{
        cl(err)

    })

  }

})
}



form.addEventListener("submit", Oncreate);
Update.addEventListener("click",UpdateMenu)

