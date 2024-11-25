import {
  Badge,
  Button,
  ButtonGroup,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
  TextField,
  Modal,
  Box,
} from "@mui/material";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "./firebase";
import "./styles.css";

// resto
// {
//    name,
//    tables [],
//    menu: {
//      'c1': {
//          'sc1': [
//              {
//                 id: 'dish_id',
//                 name: 'dish_name',
//                 desc: 'dish des',
//                 images: [],
//                 price: 100
//               },
//              {
//                 id: 'dish_id',
//                 name: 'dish_name',
//                 desc: 'dish des',
//                 images: [],
//                 price: 100
//               }
//            ],
//           'sc2': []
//        }
//     }
// }

// session
// {
//   status: 'p/o/c',
//   users: {
//     'user_id_1': {
//       id_admin: true,
//       dishes: {
//         'dish_id_1': {
//           q: 1,
//           comment: 'spicy',
//           dish_review: {}
//         },
//         'dish_id_2': {
//           q: 2,
//           comment: 'spicy',
//           dish_review: {}
//         }
//       },
//       user_review: {}
//     },

//     'user_id_2': {},

//     'user_id_3': {},
//   }
// }

interface Resto {
  name: string;
  tables: Table[];
  menu: Menu;
}

interface Table {
  name: string;
  desc: string;
}

interface Menu {
  [category: string]: CategoryMenu;
}

interface CategoryMenu {
  [subCategory: string]: Dish[];
}

interface Dish {
  id: string;
  name: string;
  desc: string;
  images: string[];
  price: number;
}

interface Session {
  status: "pending" | "ongoing" | "completed";
  users: SessionUsers;
}

interface SessionUsers {
  [user_id: string]: SessionUser;
}

interface SessionUser {
  is_admin: boolean;
  user_review: Review;
  dishes: SessionUserDishes;
}

interface SessionUserDishes {
  [dish_id: string]: SessionUserDish;
}

interface SessionUserDish {
  q: number;
  comment: string;
  dish_review: Review;
}

interface Review {
  stars: number;
  comm: string;
}

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function App() {
  const [resto, set_resto] = useState<Resto | null>(null);
  const [current_c, set_current_c] = useState("");
  const [current_sc, set_current_sc] = useState("");
  const [session, set_session] = useState<Session | null>(null);

  const [users_modal, set_um] = useState(false);
  const [dishes_modal, set_dm] = useState(false);

  const setResoDetails = () => {
    // const resto_id = ;
    // const table_name = ;
    const unsub = onSnapshot(
      doc(db, "restos", "j5u94U5kkqqF344K7GtJ"),
      (doc) => {
        set_resto(doc.data() as Resto);
      }
    );
    return () => {
      unsub();
    };
  };
  const createSession = () => {
    if (resto) {
      // const resto_id = ;
      // const table_name = ;
      const unsub = onSnapshot(
        doc(db, "sessions", `j5u94U5kkqqF344K7GtJ-t1`),
        (doc) => {
          set_session(doc.data() as Session);
        }
      );
      return () => {
        unsub();
      };
    }
  };

  const getTotalDishes = () => {
    let t = 0;
    Object.keys(session?.users || {}).forEach((user_id: string) => {
      Object.keys(
        (((session || {}).users || {})[user_id] || {}).dishes || {}
      ).forEach((dish_id) => {
        t++;
      });
    });
    return t;
  };

  const addDishToCart = (dish: Dish) => {
    // const resto_id = ;
    // const table_name = ;
    setDoc(doc(db, "sessions", `j5u94U5kkqqF344K7GtJ-t1`), {
      ...session,
      users: {
        ...session?.users,
        "current-user-id": {
          ...((session || {}).users || {})["current-user-id"],
          dishes: {
            ...(((session || {}).users || {})["current-user-id"] || {}).dishes,
            [dish.id]: {
              ...((((session || {}).users || {})["current-user-id"] || {})
                .dishes || {})[dish.id],
              q:
                Number(
                  (
                    ((((session || {}).users || {})["current-user-id"] || {})
                      .dishes || {})[dish.id] || {}
                  ).q || 0
                ) + 1,
            },
          },
        } as SessionUser,
      },
    });
  };

  const removeDishFromCart = (dish: Dish) => {
    // const resto_id = ;
    // const table_name = ;
    if (getDishCountInBag(dish.id) === 1) {
      let obj = session?.users["current-user-id"].dishes;
      delete obj[dish.id];
      setDoc(doc(db, "sessions", `j5u94U5kkqqF344K7GtJ-t1`), {
        ...session,
        users: {
          ...session?.users,
          "current-user-id": {
            ...session?.users["current-user-id"],
            dishes: obj,
          } as SessionUser,
        },
      });
    } else
      setDoc(doc(db, "sessions", `j5u94U5kkqqF344K7GtJ-t1`), {
        ...session,
        users: {
          ...session?.users,
          "current-user-id": {
            ...((session || {}).users || {})["current-user-id"],
            dishes: {
              ...(((session || {}).users || {})["current-user-id"] || {})
                .dishes,
              [dish.id]: {
                ...((((session || {}).users || {})["current-user-id"] || {})
                  .dishes || {})[dish.id],
                q:
                  Number(
                    (
                      ((((session || {}).users || {})["current-user-id"] || {})
                        .dishes || {})[dish.id] || {}
                    ).q || 0
                  ) - 1,
              },
            },
          } as SessionUser,
        },
      });
  };

  const getDishCountInBag = (dish_id: Dish["id"]) => {
    return (
      Number((session?.users["current-user-id"].dishes[dish_id] || {}).q) || 0
    );
  };

  const setDishInBagComments = (dish: Dish, comment: string) => {
    setDoc(doc(db, "sessions", `j5u94U5kkqqF344K7GtJ-t1`), {
      ...session,
      users: {
        ...session?.users,
        "current-user-id": {
          ...((session || {}).users || {})["current-user-id"],
          dishes: {
            ...(((session || {}).users || {})["current-user-id"] || {}).dishes,
            [dish.id]: {
              ...((((session || {}).users || {})["current-user-id"] || {})
                .dishes || {})[dish.id],
              comment,
            },
          },
        } as SessionUser,
      },
    });
  };

  useEffect(setResoDetails, []);
  useEffect(createSession, [resto]);
  return (
    <div className="App">
      <h1>{resto?.name}</h1>
      <Badge
        badgeContent={Object.keys(session?.users || {}).length + ` folks`}
        color="primary"
      >
        <Button onClick={() => set_um(true)}>{`table name`}</Button>
      </Badge>

      <Badge badgeContent={getTotalDishes() + ` dishes`} color="primary">
        <Button onClick={() => set_dm(true)}>{`Dish Bag`}</Button>
      </Badge>

      <ButtonGroup variant="contained" aria-label="Basic button group">
        {Object.keys(resto?.menu || {}).map((c) => (
          <Button onClick={() => set_current_c(c)}>{c}</Button>
        ))}
      </ButtonGroup>
      {current_c}
      <ButtonGroup variant="contained" aria-label="Basic button group">
        {Object.keys(resto?.menu[current_c] || {}).map((sc) => (
          <Button onClick={() => set_current_sc(sc)}>{sc}</Button>
        ))}
      </ButtonGroup>
      {current_sc}
      {resto &&
      resto.menu &&
      resto.menu[current_c] &&
      resto.menu[current_c][current_sc]
        ? resto.menu[current_c][current_sc].map((dish: Dish) => (
            <Card>
              <CardMedia
                sx={{ height: 140 }}
                image={`${dish.images[0]}`}
                title="green iguana"
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {dish.id} {dish.name}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {dish.desc}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  disabled={getDishCountInBag(dish.id) <= 0}
                  onClick={() => removeDishFromCart(dish)}
                >
                  -
                </Button>
                {getDishCountInBag(dish.id)}
                <Button size="small" onClick={() => addDishToCart(dish)}>
                  +
                </Button>
                {getDishCountInBag(dish.id) ? (
                  <TextField
                    id="outlined-multiline-flexible"
                    label="Comments or Instructions"
                    multiline
                    maxRows={4}
                    onChange={(e) => setDishInBagComments(dish, e.target.value)}
                  />
                ) : null}
              </CardActions>
            </Card>
          ))
        : null}

      <Modal
        open={users_modal}
        onClose={() => set_um(false)}
        aria-labelledby="Table folks"
        aria-describedby="All folks currently on the table"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Table folks
          </Typography>
          {Object.keys((session || {}).users || {}).map((user_id: string) => (
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              {user_id}
            </Typography>
          ))}
        </Box>
      </Modal>

      <Modal
        open={dishes_modal}
        onClose={() => set_dm(false)}
        aria-labelledby="Table dishes"
        aria-describedby="All dishes currently on the table"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Table dishes
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
          </Typography>
        </Box>
      </Modal>
    </div>
  );
}
