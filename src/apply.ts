import fetch from "node-fetch";
import color from "colorts";
import fs from "fs";
import { couponList } from "./interfaces";

export async function apply(args: string[]) {
    if (args.length == 4) {
        const result = await request(args[2], args[3]);
        getResult(result.code);
    } else if (args.length == 3) {
        const obj: couponList = JSON.parse(fs.readFileSync(args[2], "utf8"));
        for (let i = 0; i < obj.coupons.length; i++) {
            const result = await request(obj.devPlayId, obj.coupons[i]);
            getResult(result.code);
        }
    } else {
        console.log("Wrong arguments");
        process.exit(1);
    }
}

function request(devPlayId: string, couponCode: string) {
    return fetch("https://account.devplay.com/v2/coupon/ck", {
        method: "POST",
        body: JSON.stringify({
            email: devPlayId,
            coupon_code: couponCode,
        }),
        headers: { "Content-Type": "application/json" },
    })
        .then(async result => {
            return result.json();
        })
        .catch(function (err) {
            return err.message;
        });
}

function getResult(code: number) {
    switch (code) {
        case 20000:
            console.log(
                color("PASS").bgGreen +
                    ": 상품이 정상적으로 지급되었습니다. 게임에 접속해서 확인해주세요."
            );
            break;
        case 40006:
            console.log(
                color("FAIL").bgRed + ": DevPlay 계정을 다시 한번 확인해주세요."
            );
            break;
        case 42501:
            console.log(
                color("FAIL").bgRed + ": 사용 기간이 만료된 쿠폰입니다."
            );
            break;
        case 42502:
            console.log(
                color("FAIL").bgRed + ": 쿠폰번호를 다시 한번 확인해주세요."
            );
            break;
        case 42201:
        case 42503:
            console.log(
                color("FAIL").bgRed +
                    ": 해당 계정으로 이미 같은 종류의 쿠폰을 등록하셨습니다."
            );
            break;
        case 42203:
        case 42504:
            console.log(color("FAIL").bgRed + ": 이미 사용된 쿠폰입니다.");
            break;
        default:
            console.log(
                color("FAIL").bgRed +
                    ": 서버에서 알 수 없는 응답이 발생하였습니다. 잠시후 다시 시도해주세요."
            );
            break;
    }
}
