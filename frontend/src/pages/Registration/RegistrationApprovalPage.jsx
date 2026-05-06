import { Card, CardContent } from "@/components/UI/card";
import { Button } from "@/components/UI/button";
import { Badge } from "@/components/UI/badge";
import { useAppContext } from "@/store/AppProvider";
import { CheckCircle, XCircle } from "lucide-react";
export function RegistrationApprovalPage() {
    const { registrationRequests, approveRegistration, rejectRegistration } = useAppContext();
    const pendingRequests = registrationRequests.filter(r => r.status === "대기");
    const processedRequests = registrationRequests.filter(r => r.status !== "대기");
    return (<div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">회원가입 승인 관리</h2>

      {/* Pending Requests */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">대기 중인 요청</h3>
        {pendingRequests.length === 0 ? (<Card>
            <CardContent className="p-8 text-center text-gray-500">
              대기 중인 가입 요청이 없습니다.
            </CardContent>
          </Card>) : (<div className="space-y-4">
            {pendingRequests.map((request) => (<Card key={request.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">{request.name}</h4>
                        <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                          {request.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">이메일:</span> {request.email}
                        </div>
                        <div>
                          <span className="font-medium">부서:</span> {request.department}
                        </div>
                        <div>
                          <span className="font-medium">직급:</span> {request.position}
                        </div>
                        <div>
                          <span className="font-medium">신청일:</span> {request.requestDate}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button onClick={() => approveRegistration(request.id)} className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="size-4 mr-2"/>
                        승인
                      </Button>
                      <Button onClick={() => rejectRegistration(request.id)} variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                        <XCircle className="size-4 mr-2"/>
                        거절
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>))}
          </div>)}
      </div>

      {/* Processed Requests */}
      {processedRequests.length > 0 && (<div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">처리 완료</h3>
          <div className="space-y-3">
            {processedRequests.map((request) => (<Card key={request.id} className="opacity-75">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium text-gray-900">{request.name}</div>
                        <div className="text-sm text-gray-600">
                          {request.email} · {request.department} · {request.position}
                        </div>
                      </div>
                    </div>
                    <Badge className={request.status === "승인"
                    ? "bg-green-100 text-green-700 hover:bg-green-100"
                    : "bg-red-100 text-red-700 hover:bg-red-100"}>
                      {request.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>))}
          </div>
        </div>)}
    </div>);
}
