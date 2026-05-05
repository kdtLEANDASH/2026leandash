import { useState } from "react";
import { Calendar as CalendarComp } from "@/components/UI/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Badge } from "@/components/UI/badge";
import { Button } from "@/components/UI/button";
import { Plus, Users, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/UI/dialog";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { Textarea } from "@/components/UI/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/UI/select";
import { useAppContext } from "@/store/AppProvider";
export function CalendarPage() {
    const { calendarEvents, addCalendarEvent, deleteCalendarEvent, vacationRequests, employees } = useAppContext();
    const [date, setDate] = useState(new Date());
    const [showDialog, setShowDialog] = useState(false);
    const [filterType, setFilterType] = useState("전체");
    const [formData, setFormData] = useState({
        title: "",
        date: "",
        startTime: "",
        endTime: "",
        type: "개인",
        description: "",
    });
    const handleAddEvent = () => {
        if (!formData.title || !formData.date) {
            alert("제목과 날짜를 입력해주세요.");
            return;
        }
        addCalendarEvent({
            title: formData.title,
            date: formData.date,
            startTime: formData.startTime || undefined,
            endTime: formData.endTime || undefined,
            type: formData.type,
            description: formData.description || undefined,
        });
        setFormData({
            title: "",
            date: "",
            startTime: "",
            endTime: "",
            type: "개인",
            description: "",
        });
        setShowDialog(false);
    };
    // 휴가 승인된 일정 포함
    const approvedVacations = vacationRequests
        .filter(req => req.status === "승인")
        .map(req => ({
        id: req.id + 10000, // ID 충돌 방지
        title: `${req.employeeName} - ${req.type}`,
        date: req.startDate,
        type: "휴가",
        description: req.reason,
    }));
    const allEvents = [...calendarEvents, ...approvedVacations];
    const filteredEvents = filterType === "전체"
        ? allEvents
        : allEvents.filter(event => event.type === filterType);
    const selectedDateEvents = date
        ? filteredEvents.filter(event => {
            // Timezone 문제를 피하기 위해 날짜를 직접 비교
            const [eventYear, eventMonth, eventDay] = event.date.split('-').map(Number);
            return (eventDay === date.getDate() &&
                eventMonth === date.getMonth() + 1 &&
                eventYear === date.getFullYear());
        })
        : [];
    // 캘린더에 표시할 날짜들 - 일정이나 휴가가 있는 날
    const getDatesWithEvents = () => {
        const dates = new Set();
        // 사내 일정이 있는 날짜들 (공휴일 제외)
        allEvents.forEach(event => {
            if (event.type !== "공휴일") {
                dates.add(event.date);
            }
        });
        return Array.from(dates).map(dateStr => {
            const [year, month, day] = dateStr.split('-').map(Number);
            return new Date(year, month - 1, day);
        });
    };
    const datesWithEvents = getDatesWithEvents();
    // 공휴일 날짜들
    const getHolidayDates = () => {
        const dates = allEvents
            .filter(event => event.type === "공휴일")
            .map(event => {
            const [year, month, day] = event.date.split('-').map(Number);
            return new Date(year, month - 1, day);
        });
        return dates;
    };
    const holidayDates = getHolidayDates();
    const getEventColor = (type) => {
        const colors = {
            "개인": "bg-purple-100 text-purple-700 border-purple-300",
            "팀": "bg-blue-100 text-blue-700 border-blue-300",
            "전사": "bg-green-100 text-green-700 border-green-300",
            "휴가": "bg-orange-100 text-orange-700 border-orange-300",
            "공휴일": "bg-red-100 text-red-700 border-red-300",
        };
        return colors[type] || colors["개인"];
    };
    // 부서별 휴가 현황
    const vacationsByDept = employees.reduce((acc, emp) => {
        const empVacations = vacationRequests.filter(req => req.employeeId === emp.id && req.status === "승인");
        if (empVacations.length > 0) {
            if (!acc[emp.department]) {
                acc[emp.department] = [];
            }
            acc[emp.department].push({
                employee: emp.name,
                vacations: empVacations,
            });
        }
        return acc;
    }, {});
    return (<div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-1">캘린더</h2>
          <p className="text-gray-600">일정을 관리하고 팀원 휴가를 확인하세요</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="size-5 mr-2"/>
              일정 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>새 일정 추가</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">제목 *</Label>
                <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="일정 제목을 입력하세요"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">날짜 *</Label>
                  <Input id="date" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })}/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">유형</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="개인">개인</SelectItem>
                      <SelectItem value="팀">팀</SelectItem>
                      <SelectItem value="전사">전사</SelectItem>
                      <SelectItem value="공휴일">공휴일</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">시작 시간</Label>
                  <Input id="startTime" type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">종료 시간</Label>
                  <Input id="endTime" type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}/>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="일정 설명을 입력하세요" rows={3}/>
              </div>
              <div className="flex gap-3">
                <Button type="button" onClick={handleAddEvent} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  추가하기
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  취소
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>월간 캘린더</CardTitle>
                <div className="flex gap-2">
                  {["전체", "개인", "팀", "전사", "휴가", "공휴일"].map((type) => (<Button key={type} size="sm" variant={filterType === type ? "default" : "outline"} onClick={() => setFilterType(type)} className={filterType === type ? "bg-blue-600 hover:bg-blue-700" : ""}>
                      {type}
                    </Button>))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CalendarComp mode="single" selected={date} onSelect={setDate} className="rounded-md border" datesWithEvents={datesWithEvents} holidayDates={holidayDates}/>
              <div className="mt-4">
                <h4 className="font-semibold text-gray-900 mb-2">범례</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">개인</Badge>
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">팀</Badge>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">전사</Badge>
                  <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">휴가</Badge>
                  <Badge className="bg-red-100 text-red-700 hover:bg-red-100">공휴일</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Vacation Status */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="size-5"/>
                부서별 휴가 현황
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(vacationsByDept).length > 0 ? (<div className="space-y-4">
                  {Object.entries(vacationsByDept).map(([dept, data]) => (<div key={dept} className="border-l-4 border-l-orange-500 pl-4">
                      <h4 className="font-semibold text-gray-900 mb-2">{dept}</h4>
                      <div className="space-y-2">
                        {data.map((item, idx) => (<div key={idx} className="text-sm text-gray-600">
                            <span className="font-medium">{item.employee}</span>
                            {item.vacations.map((vac) => (<span key={vac.id} className="ml-2">
                                • {vac.startDate} ~ {vac.endDate} ({vac.days}일)
                              </span>))}
                          </div>))}
                      </div>
                    </div>))}
                </div>) : (<p className="text-gray-500 text-center py-8">현재 휴가 중인 직원이 없습니다</p>)}
            </CardContent>
          </Card>
        </div>

        {/* Events List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>
                {date
            ? `${date.getMonth() + 1}월 ${date.getDate()}일 일정`
            : "일정 선택"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateEvents.length > 0 ? (<div className="space-y-3">
                  {selectedDateEvents.map((event) => (<div key={event.id} className={`p-3 rounded-lg border ${getEventColor(event.type)}`}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{event.title}</h4>
                        {event.id < 10000 && (<Button size="sm" variant="ghost" onClick={() => deleteCalendarEvent(event.id)} className="h-6 w-6 p-0">
                            <Trash2 className="size-4"/>
                          </Button>)}
                      </div>
                      {event.startTime && event.endTime && (<p className="text-sm mb-1">
                          {event.startTime} - {event.endTime}
                        </p>)}
                      {event.description && (<p className="text-sm">{event.description}</p>)}
                      <Badge className="mt-2" variant="outline">
                        {event.type}
                      </Badge>
                    </div>))}
                </div>) : (<p className="text-gray-500 text-center py-8">
                  이 날짜에 일정이 없습니다
                </p>)}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>다가오는 일정</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredEvents
            .filter(event => new Date(event.date) >= new Date())
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 5)
            .map((event) => (<div key={event.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => setDate(new Date(event.date))}>
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 text-sm">
                          {event.title}
                        </h5>
                        <p className="text-xs text-gray-600">
                          {new Date(event.date).toLocaleDateString("ko-KR")}
                        </p>
                      </div>
                      <Badge className={`text-xs ${getEventColor(event.type)}`}>
                        {event.type}
                      </Badge>
                    </div>))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>);
}
